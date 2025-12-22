import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Job)
        private jobRepository: Repository<Job>,
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
