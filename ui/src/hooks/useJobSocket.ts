import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  JobSocketEvent,
  type JobStatusUpdatedPayload,
  type Job,
  ApiRoutes,
} from "@job-queue-monitor/shared";
import { useSWRConfig } from "swr";

// In a real app, this should come from environment variables
const SOCKET_URL = "http://localhost:3000";

export const useJobSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL);

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on(
      JobSocketEvent.JOB_STATUS_UPDATED,
      (payload: JobStatusUpdatedPayload) => {
        console.log("Job status updated:", payload);

        // Update the cache locally without re-fetching
        mutate(
          (key) => typeof key === "string" && key.startsWith(ApiRoutes.JOBS),
          (currentData: Job | Job[] | undefined) => {
            if (!currentData) return currentData;

            // Case 1: List view (currentData is an array of jobs)
            if (Array.isArray(currentData)) {
              const index = currentData.findIndex(
                (j) => j.nanoId === payload.nanoId
              );
              if (index !== -1) {
                const newData = [...currentData];
                newData[index] = { ...newData[index], status: payload.status };
                return newData;
              }
            }
            // Case 2: Detail view (currentData is a single job object)
            else if (currentData.nanoId === payload.nanoId) {
              return { ...currentData, status: payload.status };
            }

            return currentData;
          },
          { revalidate: false }
        );
      }
    );

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [mutate]);
};
