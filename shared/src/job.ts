import { IsEnum, IsNotEmpty, IsString, IsOptional, IsObject } from "class-validator";

export enum JobStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum JobType {
  MOCK = "mock",
  API_CALL = "api_call",
  MATH = "math",
}

export interface MockJobData {
  duration?: number;
}

export interface MockJobResult {
  message: string;
  duration: number;
}

export interface ApiCallJobData {
  url: string;
  method?: string;
  body?: unknown;
}

export interface ApiCallJobResult {
  status: number;
  statusText: string;
  data: unknown;
}

export interface MathJobData {
  n: number;
}

export interface MathJobResult {
  n: number;
  fibonacci: number;
}

export interface ErrorJobResult {
  error: string;
}

export type JobData = MockJobData | ApiCallJobData | MathJobData;
export type JobResult = MockJobResult | ApiCallJobResult | MathJobResult | ErrorJobResult;

export interface Job {
  nanoId: string;
  name: string;
  type: JobType;
  status: JobStatus;
  data: JobData;
  result: JobResult | null;
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

  @IsEnum(JobType)
  @IsNotEmpty()
  type: JobType;

  @IsObject()
  @IsOptional()
  data?: JobData;
}
