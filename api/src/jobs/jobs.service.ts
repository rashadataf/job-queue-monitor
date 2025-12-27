import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job as BullJob } from 'bullmq';
import {
    CreateJobDto,
    JobStatus,
    JobResult,
    JobQueryParams,
    SortField,
    SortOrder,
    JobPriority,
    JobMetrics,
    JobType,
    JobData,
} from '@shared';
import { Job } from './entities/job.entity';
import { JOB_QUEUE_NAME } from './jobs.constants';
import { JobsGateway } from './jobs.gateway';

// Interface for BullMQ job data payload
interface QueueJobData {
    nanoId: string;
    type: JobType;
    data: JobData;
}

@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    // Map SortField enum to actual entity column names for type safety
    private readonly sortFieldMap: Record<SortField, keyof Job> = {
        [SortField.CREATED_AT]: 'createdAt',
        [SortField.UPDATED_AT]: 'updatedAt',
        [SortField.STARTED_AT]: 'startedAt',
        [SortField.COMPLETED_AT]: 'completedAt',
    };

    constructor(
        @InjectRepository(Job)
        private jobRepository: Repository<Job>,
        @InjectQueue(JOB_QUEUE_NAME) private jobQueue: Queue,
        private readonly jobsGateway: JobsGateway,
    ) {}

    async findAll(
        page: number = 1,
        limit: number = 10,
        queryParams?: JobQueryParams,
    ): Promise<{
        data: Job[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const alias = Job.name.toLowerCase();
        const queryBuilder = this.jobRepository.createQueryBuilder(alias);

        // Apply status filter using object notation (more type-safe)
        if (queryParams?.status) {
            queryBuilder.andWhere({ status: queryParams.status });
        }

        // Apply search filter using Brackets for complex OR conditions
        if (queryParams?.search) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where(`${alias}.name ILIKE :search`, {
                        search: `%${queryParams.search}%`,
                    }).orWhere(`CAST(${alias}.nanoId AS TEXT) ILIKE :search`);
                }),
            );
        }

        // Apply sorting with type-safe field mapping
        const sortBy = queryParams?.sortBy || SortField.CREATED_AT;
        const sortOrder = queryParams?.sortOrder || SortOrder.DESC;
        const sortColumn = this.sortFieldMap[sortBy];
        queryBuilder.orderBy(
            `${alias}.${sortColumn}`,
            sortOrder.toUpperCase() as 'ASC' | 'DESC',
        );

        // Apply pagination
        queryBuilder.skip((page - 1) * limit).take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
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
            type: createJobDto.type,
            data: createJobDto.data,
            status: JobStatus.PENDING,
            priority: createJobDto.priority || JobPriority.NORMAL,
            autoRetry: createJobDto.autoRetry || false,
            maxRetries: createJobDto.maxRetries || 3,
            retryCount: 0,
        });
        const savedJob = await this.jobRepository.save(job);

        // Emit job created event
        this.jobsGateway.emitJobCreated(savedJob);

        this.logger.log(
            `Adding job ${savedJob.nanoId} to queue with priority ${savedJob.priority}`,
        );

        await this.jobQueue.add(
            'process-job',
            {
                nanoId: savedJob.nanoId,
                type: savedJob.type,
                data: savedJob.data,
            },
            {
                priority: savedJob.priority,
            },
        );

        return savedJob;
    }

    async retryJob(nanoId: string, delay?: number): Promise<Job> {
        const job = await this.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }

        // Reset job state
        job.status = JobStatus.PENDING;
        job.startedAt = null;
        job.completedAt = null;
        job.result = null;
        job.retryCount += 1;

        const savedJob = await this.jobRepository.save(job);

        // Emit status update
        this.jobsGateway.emitJobStatusUpdate({
            job: savedJob,
            timestamp: new Date().toISOString(),
        });

        // Re-add to BullMQ queue with priority and optional delay
        await this.jobQueue.add(
            'process-job',
            {
                nanoId: savedJob.nanoId,
                type: savedJob.type,
                data: savedJob.data,
            },
            {
                priority: savedJob.priority,
                delay: delay, // Delay in milliseconds
            },
        );

        return savedJob;
    }

    async updateStatusByNanoId(
        nanoId: string,
        status: JobStatus,
        result?: JobResult,
    ): Promise<Job> {
        const job = await this.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }

        job.status = status;

        if (result !== undefined) {
            job.result = result;
        }

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

    async deleteJob(nanoId: string): Promise<void> {
        const job = await this.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }

        // Prevent deletion of running jobs
        if (job.status === JobStatus.RUNNING) {
            throw new BadRequestException(
                'Cannot delete a running job. Please wait for it to complete or fail.',
            );
        }

        await this.jobRepository.remove(job);
    }

    async pauseJob(nanoId: string): Promise<Job> {
        const job = await this.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }

        // Can only pause pending jobs
        if (job.status !== JobStatus.PENDING) {
            throw new BadRequestException(
                'Can only pause jobs that are pending',
            );
        }

        job.isPaused = true;
        job.status = JobStatus.PAUSED;

        const savedJob = await this.jobRepository.save(job);

        // Emit status update
        this.jobsGateway.emitJobStatusUpdate({
            job: savedJob,
            timestamp: new Date().toISOString(),
        });

        // Remove from BullMQ queue
        const bullJobs = await this.jobQueue.getJobs([
            'waiting',
            'prioritized',
        ]);
        const bullJob = bullJobs.find(
            (bj: BullJob<QueueJobData>) => bj.data.nanoId === nanoId,
        );
        if (bullJob) {
            await bullJob.remove();
        }

        return savedJob;
    }

    async resumeJob(nanoId: string): Promise<Job> {
        const job = await this.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }

        // Can only resume paused jobs
        if (job.status !== JobStatus.PAUSED) {
            throw new BadRequestException('Can only resume paused jobs');
        }

        job.isPaused = false;
        job.status = JobStatus.PENDING;

        const savedJob = await this.jobRepository.save(job);

        // Emit status update
        this.jobsGateway.emitJobStatusUpdate({
            job: savedJob,
            timestamp: new Date().toISOString(),
        });

        // Re-add to BullMQ queue
        await this.jobQueue.add(
            'process-job',
            {
                nanoId: savedJob.nanoId,
                type: savedJob.type,
                data: savedJob.data,
            },
            {
                priority: savedJob.priority,
            },
        );

        return savedJob;
    }

    // async getMetrics(): Promise<JobMetrics> {
    //     if (job.status === JobStatus.RUNNING) {
    //         throw new BadRequestException(
    //             'Cannot delete a running job. Please wait for it to complete or fail.',
    //         );
    //     }

    //     await this.jobRepository.remove(job);
    // }

    async getMetrics(): Promise<JobMetrics> {
        // Get real-time queue metrics from BullMQ (fast, Redis-based)
        const queueCounts = await this.jobQueue.getJobCounts(
            'waiting',
            'active',
            'completed',
            'failed',
            'delayed',
            'paused',
            'prioritized',
        );

        // Log for debugging
        this.logger.debug(
            `BullMQ Queue Counts: ${JSON.stringify(queueCounts)}`,
        );

        const queueMetrics = {
            waiting:
                (queueCounts.waiting || 0) + (queueCounts.prioritized || 0),
            active: queueCounts.active || 0,
            completed: queueCounts.completed || 0,
            failed: queueCounts.failed || 0,
            delayed: queueCounts.delayed || 0,
            paused: queueCounts.paused || 0,
        };

        // Get all jobs from database for historical analytics
        const queryBuilder = this.jobRepository.createQueryBuilder('job');
        const allJobs = await queryBuilder.getMany();

        // Calculate totals by status (from database for historical data)
        const byStatus = {
            pending: allJobs.filter((j) => j.status === JobStatus.PENDING)
                .length,
            running: allJobs.filter((j) => j.status === JobStatus.RUNNING)
                .length,
            completed: allJobs.filter((j) => j.status === JobStatus.COMPLETED)
                .length,
            failed: allJobs.filter((j) => j.status === JobStatus.FAILED).length,
            paused: allJobs.filter((j) => j.status === JobStatus.PAUSED).length,
        };

        // Calculate totals by priority
        const byPriority = {
            critical: allJobs.filter((j) => j.priority === JobPriority.CRITICAL)
                .length,
            high: allJobs.filter((j) => j.priority === JobPriority.HIGH).length,
            normal: allJobs.filter((j) => j.priority === JobPriority.NORMAL)
                .length,
            low: allJobs.filter((j) => j.priority === JobPriority.LOW).length,
        };

        // Calculate totals by type
        const byType: { [key: string]: number } = {};
        allJobs.forEach((job) => {
            byType[job.type] = (byType[job.type] || 0) + 1;
        });

        // Calculate success rate
        const completedJobs = allJobs.filter(
            (j) =>
                j.status === JobStatus.COMPLETED ||
                j.status === JobStatus.FAILED,
        );
        const successRate =
            completedJobs.length > 0
                ? (byStatus.completed / completedJobs.length) * 100
                : 0;

        // Calculate average processing time (for completed jobs with start and complete times)
        const jobsWithTimes = allJobs.filter(
            (j) => j.startedAt && j.completedAt,
        );
        const averageProcessingTime =
            jobsWithTimes.length > 0
                ? jobsWithTimes.reduce((sum, job) => {
                      const duration =
                          job.completedAt!.getTime() - job.startedAt!.getTime();
                      return sum + duration;
                  }, 0) / jobsWithTimes.length
                : 0;

        // Calculate recent trends
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(
            now.getTime() - 24 * 60 * 60 * 1000,
        );

        const lastHour = allJobs.filter(
            (j) => j.createdAt >= oneHourAgo,
        ).length;
        const last24Hours = allJobs.filter(
            (j) => j.createdAt >= twentyFourHoursAgo,
        ).length;

        // Calculate jobs per hour (based on last 24 hours)
        const jobsPerHour = last24Hours / 24;

        return {
            total: allJobs.length,
            byStatus,
            byPriority,
            byType,
            queueMetrics,
            successRate: Math.round(successRate * 100) / 100,
            averageProcessingTime: Math.round(averageProcessingTime),
            jobsPerHour: Math.round(jobsPerHour * 100) / 100,
            recentTrend: {
                lastHour,
                last24Hours,
            },
        };
    }
}
