import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobsService } from './jobs.service';
import {
    JobStatus,
    JobType,
    JobData,
    JobResult,
    ApiCallJobData,
    MathJobData,
    MockJobData,
} from '@job-queue-monitor/shared';
import { Logger } from '@nestjs/common';
import { JOB_QUEUE_NAME } from './jobs.constants';
import { JobsGateway } from './jobs.gateway';

@Processor(JOB_QUEUE_NAME, {
    concurrency: 1, // Process one job at a time in priority order
})
export class JobsProcessor extends WorkerHost {
    private readonly logger = new Logger(JobsProcessor.name);

    constructor(
        private readonly jobsService: JobsService,
        private readonly jobsGateway: JobsGateway,
    ) {
        super();
    }

    async process(
        job: Job<{ nanoId: string; type: JobType; data: JobData }>,
    ): Promise<JobResult> {
        const { nanoId, type, data } = job.data;
        this.logger.log(
            `Processing job ${nanoId} (Type: ${type}, Priority: ${job.opts.priority})`,
        );

        // 1. Update status to RUNNING
        const runningJob = await this.jobsService.updateStatusByNanoId(
            nanoId,
            JobStatus.RUNNING,
        );
        this.jobsGateway.emitJobStatusUpdate({
            job: runningJob,
            timestamp: new Date().toISOString(),
        });

        try {
            let result: JobResult;

            switch (type) {
                case JobType.API_CALL:
                    try {
                        const apiData = data as ApiCallJobData;
                        const response = await fetch(apiData.url, {
                            method: apiData.method || 'GET',
                            body: apiData.body
                                ? JSON.stringify(apiData.body)
                                : undefined,
                            headers: { 'Content-Type': 'application/json' },
                        });

                        // Check if response is successful (2xx status codes)
                        if (!response.ok) {
                            throw new Error(
                                `API Call failed with status ${response.status}: ${response.statusText}`,
                            );
                        }

                        let responseData: unknown;
                        const contentType =
                            response.headers.get('content-type');
                        if (
                            contentType &&
                            contentType.includes('application/json')
                        ) {
                            responseData = await response.json();
                        } else {
                            responseData = { text: await response.text() };
                        }
                        result = {
                            status: response.status,
                            statusText: response.statusText,
                            data: responseData,
                        };
                    } catch (error) {
                        const err =
                            error instanceof Error
                                ? error
                                : new Error(String(error));
                        throw new Error(`API Call failed: ${err.message}`);
                    }
                    break;

                case JobType.MATH: {
                    const mathData = data as MathJobData;
                    const n = Number(mathData.n) || 10;
                    if (n > 1000) throw new Error('n must be <= 1000');
                    result = {
                        n,
                        fibonacci: this.calculateFibonacci(n),
                    };
                    break;
                }

                case JobType.MOCK:
                default: {
                    const mockData = data as MockJobData;
                    const duration = mockData.duration || 5000;
                    await new Promise((resolve) =>
                        setTimeout(resolve, duration),
                    );

                    // Simulate failure if requested
                    if (mockData.shouldFail) {
                        throw new Error(
                            'Mock job intentionally failed for testing',
                        );
                    }

                    result = { message: 'Mock job completed', duration };
                    break;
                }
            }

            // 3. Update status to COMPLETED
            const completedJob = await this.jobsService.updateStatusByNanoId(
                nanoId,
                JobStatus.COMPLETED,
                result,
            );
            this.jobsGateway.emitJobStatusUpdate({
                job: completedJob,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`Job ${nanoId} completed`);

            return result;
        } catch (error) {
            const err =
                error instanceof Error ? error : new Error(String(error));
            this.logger.error(
                `Job ${nanoId} failed: ${err.message}`,
                err.stack,
            );

            // Get the job from database to check auto-retry settings
            const jobEntity = await this.jobsService.findOneByNanoId(nanoId);

            if (
                jobEntity &&
                jobEntity.autoRetry &&
                jobEntity.retryCount < jobEntity.maxRetries
            ) {
                this.logger.log(
                    `Auto-retrying job ${nanoId} (Attempt ${jobEntity.retryCount + 1}/${jobEntity.maxRetries})`,
                );

                // Calculate exponential backoff delay
                const retryDelay = Math.min(
                    1000 * Math.pow(2, jobEntity.retryCount),
                    30000,
                ); // Max 30 seconds

                // Schedule retry with delay (non-blocking - allows other jobs to process)
                await this.jobsService.retryJob(nanoId, retryDelay);

                this.logger.log(
                    `Job ${nanoId} scheduled for retry in ${retryDelay}ms`,
                );

                throw err; // Still throw to mark this attempt as failed
            }

            const failedJob = await this.jobsService.updateStatusByNanoId(
                nanoId,
                JobStatus.FAILED,
                { error: err.message },
            );
            this.jobsGateway.emitJobStatusUpdate({
                job: failedJob,
                timestamp: new Date().toISOString(),
            });
            throw err;
        }
    }

    private calculateFibonacci(n: number): number {
        if (n <= 1) return n;
        let a = 0,
            b = 1;
        for (let i = 2; i <= n; i++) {
            const temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}
