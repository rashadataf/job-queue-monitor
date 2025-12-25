import { useCallback, useState } from "react";
import useSWR from "swr";
import { jobsApi } from "@/services/api";
import {
  type CreateJobDto,
  type Job,
  type JobStatus,
  ApiRoutes,
  type PaginatedResult,
  type JobQueryParams,
  SortField,
  SortOrder,
} from "@job-queue-monitor/shared";

/**
 * Hook for managing the jobs list with CRUD operations
 */
export function useJobs() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<JobStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortField>(SortField.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);

  const queryParams: Omit<JobQueryParams, "page" | "limit"> = {
    status,
    sortBy,
    sortOrder,
  };

  const { data, error, isLoading, mutate } = useSWR<PaginatedResult<Job>>(
    [ApiRoutes.JOBS, page, limit, status, sortBy, sortOrder],
    () => jobsApi.fetchJobs(page, limit, queryParams),
    {
      refreshInterval: 5000, // Auto-refresh every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  /**
   * Create a new job
   */
  const createJob = useCallback(async (jobData: CreateJobDto): Promise<Job> => {
    const newJob = await jobsApi.createJob(jobData);
    return newJob;
  }, []);

  /**
   * Manually refresh the jobs list
   */
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    jobs: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    createJob,
    refresh,
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}

/**
 * Hook for fetching a single job by nanoId with auto-refresh
 * Use this instead of searching cached data for up-to-date information
 */
export function useJob(nanoId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Job | null>(
    nanoId ? `${ApiRoutes.JOBS}/${nanoId}` : null,
    nanoId ? () => jobsApi.fetchJobByNanoId(nanoId) : null,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const updateStatus = useCallback(
    async (status: JobStatus) => {
      if (!nanoId) return;
      // Optimistic update could go here, but for simplicity we'll wait
      await jobsApi.updateJobStatus(nanoId, status);
      mutate();
    },
    [nanoId, mutate]
  );

  const retryJob = useCallback(async () => {
    if (!nanoId) return;
    await jobsApi.retryJob(nanoId);
    mutate();
  }, [nanoId, mutate]);

  return {
    job: data,
    isLoading,
    isError: error,
    refresh,
    updateStatus,
    retryJob,
  };
}
