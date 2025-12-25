import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum JobStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Job {
  nanoId: string;
  name: string;
  status: JobStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  @IsNotEmpty()
  status: JobStatus;
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
