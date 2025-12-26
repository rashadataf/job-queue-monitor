import { JobStatus, Job } from "./job";

export enum JobSocketEvent {
  JOB_STATUS_UPDATED = "job.status.updated",
  JOB_CREATED = "job.created",
}

export interface JobStatusUpdatedPayload {
  job: Job;
  timestamp: string;
}

export interface JobCreatedPayload {
  job: Job;
}
