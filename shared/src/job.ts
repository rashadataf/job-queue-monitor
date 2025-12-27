import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsArray,
} from "class-validator";

export enum JobStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  PAUSED = "paused",
}

export enum JobType {
  MOCK = "mock",
  API_CALL = "api_call",
  MATH = "math",
}

export enum JobPriority {
  CRITICAL = 1, // Highest priority (lowest number)
  HIGH = 2,
  NORMAL = 3,
  LOW = 4, // Lowest priority (highest number)
}

export interface MockJobData {
  duration?: number;
  shouldFail?: boolean;
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
export type JobResult =
  | MockJobResult
  | ApiCallJobResult
  | MathJobResult
  | ErrorJobResult;

export enum SortField {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  STARTED_AT = "startedAt",
  COMPLETED_AT = "completedAt",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export interface JobQueryParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  search?: string;
}

export interface Job {
  nanoId: string;
  name: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  autoRetry: boolean;
  maxRetries: number;
  retryCount: number;
  isPaused: boolean;
  data: JobData;
  result: JobResult | null;
  startedAt: Date | null;
  completedAt: Date | null;
  scheduledAt: Date | null;
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

  @IsEnum(JobPriority)
  @IsOptional()
  priority?: JobPriority;

  @IsBoolean()
  @IsOptional()
  autoRetry?: boolean;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxRetries?: number;

  @IsObject()
  @IsOptional()
  data?: JobData;

  @IsOptional()
  scheduledAt?: Date;
}

export enum BulkAction {
  DELETE = "delete",
  RETRY = "retry",
  PAUSE = "pause",
  RESUME = "resume",
}

export class BulkJobActionDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  nanoIds: string[];

  @IsEnum(BulkAction)
  @IsNotEmpty()
  action: BulkAction;
}

export interface BulkActionResult {
  success: string[];
  failed: Array<{ nanoId: string; error: string }>;
}

export interface JobsByStatus {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  paused: number;
}

export interface JobsByPriority {
  critical: number;
  high: number;
  normal: number;
  low: number;
}

export interface JobsByType {
  [key: string]: number;
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface JobMetrics {
  total: number;
  byStatus: JobsByStatus;
  byPriority: JobsByPriority;
  byType: JobsByType;
  queueMetrics: QueueMetrics;
  successRate: number;
  averageProcessingTime: number; // in milliseconds
  jobsPerHour: number;
  recentTrend: {
    lastHour: number;
    last24Hours: number;
  };
}
