import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    NotFoundException,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './entities/job.entity';

@Controller('jobs')
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
}
