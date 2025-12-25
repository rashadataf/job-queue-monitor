import {
  type CreateJobDto,
  type Job,
  type JobStatus,
  ApiRoutes,
  type PaginatedResult,
} from "@job-queue-monitor/shared";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const jobsApi = {
  async fetchJobs(page = 1, limit = 10): Promise<PaginatedResult<Job>> {
    const response = await api.get<PaginatedResult<Job>>(ApiRoutes.JOBS, {
      params: { page, limit },
    });
    return response.data;
  },

  async fetchJobByNanoId(nanoId: string): Promise<Job> {
    const response = await api.get<Job>(`${ApiRoutes.JOBS}/${nanoId}`);
    return response.data;
  },

  async createJob(data: CreateJobDto): Promise<Job> {
    const response = await api.post<Job>(ApiRoutes.JOBS, data);
    return response.data;
  },

  async updateJobStatus(nanoId: string, status: JobStatus): Promise<Job> {
    const response = await api.patch<Job>(
      `${ApiRoutes.JOBS}/${nanoId}/status`,
      { status }
    );
    return response.data;
  },

  async retryJob(nanoId: string): Promise<Job> {
    const response = await api.post<Job>(`${ApiRoutes.JOBS}/${nanoId}/retry`);
    return response.data;
  },
};
