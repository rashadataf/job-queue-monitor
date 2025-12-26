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
    Query,
    DefaultValuePipe,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import {
    CreateJobDto,
    UpdateJobStatusDto,
    ApiRoutes,
    PaginatedResult,
    JobStatus,
    SortField,
    SortOrder,
    JobMetrics,
} from '@shared';

@Controller(ApiRoutes.JOBS)
@UseInterceptors(ClassSerializerInterceptor)
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status?: JobStatus,
        @Query('sortBy') sortBy?: SortField,
        @Query('sortOrder') sortOrder?: SortOrder,
        @Query('search') search?: string,
    ): Promise<PaginatedResult<Job>> {
        return this.jobsService.findAll(page, limit, {
            status,
            sortBy,
            sortOrder,
            search,
        });
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

    @Post(':nanoId/retry')
    async retry(@Param('nanoId') nanoId: string): Promise<Job> {
        return this.jobsService.retryJob(nanoId);
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

    @Delete(':nanoId')
    async delete(
        @Param('nanoId') nanoId: string,
    ): Promise<{ message: string }> {
        await this.jobsService.deleteJob(nanoId);
        return { message: `Job ${nanoId} deleted successfully` };
    }

    @Get('metrics/dashboard')
    async getMetrics(): Promise<JobMetrics> {
        return this.jobsService.getMetrics();
    }
}
