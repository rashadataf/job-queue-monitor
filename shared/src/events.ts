import { JobStatus, Job } from "./job";

export enum JobSocketEvent {
  JOB_STATUS_UPDATED = "job.status.updated",
  JOB_CREATED = "job.created",
}

export interface JobStatusUpdatedPayload {
  nanoId: string;
  status: JobStatus;
  timestamp: string;
}

export interface JobCreatedPayload {
  job: Job;
}
