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
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
