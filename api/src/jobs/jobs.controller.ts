import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    NotFoundException,
    UseInterceptors,
    ClassSerializerInterceptor,
    Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import {
    CreateJobDto,
    UpdateJobStatusDto,
    ApiRoutes,
} from '@job-queue-monitor/shared';

@Controller(ApiRoutes.JOBS)
@UseInterceptors(ClassSerializerInterceptor)
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    async findAll(): Promise<Job[]> {
        const jobs = await this.jobsService.findAll();
        return jobs;
    }

    @Get(':nanoId')
    async findOne(@Param('nanoId') nanoId: string): Promise<Job> {
        const job = await this.jobsService.findOneByNanoId(nanoId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${nanoId} not found`);
        }
        return job;
    }

    @Post()
    async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
        return this.jobsService.create(createJobDto);
    }

    @Patch(':nanoId/status')
    async updateStatus(
        @Param('nanoId') nanoId: string,
        @Body() updateJobStatusDto: UpdateJobStatusDto,
    ): Promise<Job> {
        return this.jobsService.updateStatusByNanoId(
            nanoId,
            updateJobStatusDto.status,
        );
    }
}
