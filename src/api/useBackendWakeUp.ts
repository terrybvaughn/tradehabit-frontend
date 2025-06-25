import { useEffect } from "react";
import { apiClient } from "./client";

/**
 * Fire-and-forget request that wakes the backend from an autosleep state.
 * Swallows any error because the only goal is to trigger a cold-start.
 */
export function useBackendWakeUp(): void {
  useEffect(() => {
    apiClient.get("/api/health").catch(() => {
      /* no-op */
    });
  }, []);
} 