import type { CreateJobDto, Job, JobStatus } from "@job-queue-monitor/shared";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const jobsApi = {
  async fetchJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>("/jobs");
    return response.data;
  },

  async fetchJobByNanoId(nanoId: string): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${nanoId}`);
    return response.data;
  },

  async createJob(data: CreateJobDto): Promise<Job> {
    const response = await api.post<Job>("/jobs", data);
    return response.data;
  },

  async updateJobStatus(nanoId: string, status: JobStatus): Promise<Job> {
    const response = await api.patch<Job>(`/jobs/${nanoId}/status`, { status });
    return response.data;
  },
};
