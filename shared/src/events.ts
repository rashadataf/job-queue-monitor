import { JobStatus } from "./job";

export enum JobSocketEvent {
  JOB_STATUS_UPDATED = "job.status.updated",
}

export interface JobStatusUpdatedPayload {
  nanoId: string;
  status: JobStatus;
  timestamp: string;
}
