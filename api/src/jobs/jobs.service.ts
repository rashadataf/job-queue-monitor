import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobStatus } from '@job-queue-monitor/shared';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { JOB_QUEUE_NAME } from './jobs.constants';
import { JobsGateway } from './jobs.gateway';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Job)
        private jobRepository: Repository<Job>,
        @InjectQueue(JOB_QUEUE_NAME) private jobQueue: Queue,
        private readonly jobsGateway: JobsGateway,
    ) {}

    async findAll(): Promise<Job[]> {
        return this.jobRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Job | null> {
        return this.jobRepository.findOneBy({ id });
    }

    async findOneByNanoId(nanoId: string): Promise<Job | null> {
        return this.jobRepository.findOneBy({ nanoId });
    }

    async create(createJobDto: CreateJobDto): Promise<Job> {
        const job = this.jobRepository.create({
            name: createJobDto.name,
            status: JobStatus.PENDING,
        });
        const savedJob = await this.jobRepository.save(job);

        // Emit job created event
        this.jobsGateway.emitJobCreated(savedJob);

        // Add to BullMQ queue
        // We simulate a duration between 5s and 15s
        const duration = Math.floor(Math.random() * 10000) + 5000;

        await this.jobQueue.add('process-job', {
            nanoId: savedJob.nanoId,
            duration,
        });

        return savedJob;
    }

    async updateStatusByNanoId(
        nanoId: string,
        status: JobStatus,
    ): Promise<Job> {
        const job = await this.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }

        job.status = status;

        if (status === JobStatus.RUNNING && !job.startedAt) {
            job.startedAt = new Date();
        }

        if (
            (status === JobStatus.COMPLETED || status === JobStatus.FAILED) &&
            !job.completedAt
        ) {
            job.completedAt = new Date();
        }

        // Reset completedAt if restarting a job
        if (status === JobStatus.PENDING || status === JobStatus.RUNNING) {
            job.completedAt = null;
        }

        // Reset startedAt if resetting to pending
        if (status === JobStatus.PENDING) {
            job.startedAt = null;
        }

        return this.jobRepository.save(job);
    }

    async updateStatus(id: number, status: JobStatus): Promise<Job | null> {
        const job = await this.findOne(id);
        if (!job) {
            return null;
        }

        job.status = status;

        if (status === JobStatus.RUNNING && !job.startedAt) {
            job.startedAt = new Date();
        }

        if (
            (status === JobStatus.COMPLETED || status === JobStatus.FAILED) &&
            !job.completedAt
        ) {
            job.completedAt = new Date();
        }

        return this.jobRepository.save(job);
    }
}
