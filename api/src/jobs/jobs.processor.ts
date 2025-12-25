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

@Processor(JOB_QUEUE_NAME)
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
        this.logger.log(`Processing job ${nanoId} (Type: ${type})`);

        // 1. Update status to RUNNING
        await this.jobsService.updateStatusByNanoId(nanoId, JobStatus.RUNNING);
        this.jobsGateway.emitJobStatusUpdate({
            nanoId,
            status: JobStatus.RUNNING,
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
                    result = { message: 'Mock job completed', duration };
                    break;
                }
            }

            // 3. Update status to COMPLETED
            await this.jobsService.updateStatusByNanoId(
                nanoId,
                JobStatus.COMPLETED,
                result,
            );
            this.jobsGateway.emitJobStatusUpdate({
                nanoId,
                status: JobStatus.COMPLETED,
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
            await this.jobsService.updateStatusByNanoId(
                nanoId,
                JobStatus.FAILED,
                { error: err.message },
            );
            this.jobsGateway.emitJobStatusUpdate({
                nanoId,
                status: JobStatus.FAILED,
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
