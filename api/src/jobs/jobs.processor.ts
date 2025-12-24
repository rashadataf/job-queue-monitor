import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobsService } from './jobs.service';
import { JobStatus } from '@job-queue-monitor/shared';
import { Logger } from '@nestjs/common';
import { JOB_QUEUE_NAME } from './jobs.constants';

@Processor(JOB_QUEUE_NAME)
export class JobsProcessor extends WorkerHost {
    private readonly logger = new Logger(JobsProcessor.name);

    constructor(private readonly jobsService: JobsService) {
        super();
    }

    async process(
        job: Job<{ nanoId: string; duration: number }>,
    ): Promise<any> {
        const { nanoId, duration } = job.data;
        this.logger.log(`Processing job ${nanoId} (Duration: ${duration}ms)`);

        // 1. Update status to RUNNING
        await this.jobsService.updateStatusByNanoId(nanoId, JobStatus.RUNNING);

        // 2. Simulate work (sleep)
        await new Promise((resolve) => setTimeout(resolve, duration));

        // 3. Randomly fail some jobs for "fun" (optional, good for testing UI)
        if (Math.random() > 0.8) {
            await this.jobsService.updateStatusByNanoId(
                nanoId,
                JobStatus.FAILED,
            );
            throw new Error('Random simulated failure occurred!');
        }

        // 4. Update status to COMPLETED
        await this.jobsService.updateStatusByNanoId(
            nanoId,
            JobStatus.COMPLETED,
        );
        this.logger.log(`Job ${nanoId} completed`);
    }
}
