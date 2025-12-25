import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  JobSocketEvent,
  type JobStatusUpdatedPayload,
  type JobCreatedPayload,
  type Job,
  ApiRoutes,
  type PaginatedResult,
} from "@job-queue-monitor/shared";
import { useSWRConfig } from "swr";

// In a real app, this should come from environment variables
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useJobSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on(JobSocketEvent.JOB_CREATED, (payload: JobCreatedPayload) => {
      console.log("Job created:", payload);

      // Update all paginated job lists in the cache
      mutate(
        (key) => Array.isArray(key) && key[0] === ApiRoutes.JOBS,
        (currentData: PaginatedResult<Job> | undefined) => {
          if (!currentData) return currentData;

          // Add new job to the beginning of the list
          const newData = [payload.job, ...currentData.data];
          
          return {
            data: newData,
            meta: {
              ...currentData.meta,
              total: currentData.meta.total + 1,
              totalPages: Math.ceil((currentData.meta.total + 1) / currentData.meta.limit),
            },
          };
        },
        { revalidate: false }
      );
    });

    socket.on(
      JobSocketEvent.JOB_STATUS_UPDATED,
      (payload: JobStatusUpdatedPayload) => {
        console.log("Job status updated:", payload);

        // Update the cache locally without re-fetching
        mutate(
          (key) =>
            (Array.isArray(key) && key[0] === ApiRoutes.JOBS) ||
            (typeof key === "string" && key.startsWith(ApiRoutes.JOBS)),
          (currentData: PaginatedResult<Job> | Job | undefined) => {
            if (!currentData) return currentData;

            // Case 1: List view (PaginatedResult)
            if ("data" in currentData && Array.isArray(currentData.data)) {
              const result = currentData as PaginatedResult<Job>;
              const jobIndex = result.data.findIndex(
                (j) => j.nanoId === payload.nanoId
              );
              if (jobIndex === -1) return currentData;
              const updatedJobs = [...result.data];
              updatedJobs[jobIndex] = {
                ...updatedJobs[jobIndex],
                status: payload.status,
              };

              return { ...result, data: updatedJobs };
            }
            // Case 2: Detail view (Job)
            else if ("nanoId" in currentData) {
              const job = currentData as Job;
              if (job.nanoId === payload.nanoId) {
                return { ...job, status: payload.status };
              }
            }

            return currentData;
          },
          { revalidate: false }
        );
      }
    );

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [mutate]);
};
