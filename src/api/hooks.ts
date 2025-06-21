import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AnalyzeResponse, SummaryResponse, TradesResponse, LossesResponse, Insights, Goals } from "./types";
import { TradeHabitApiError } from "./client";

/**
 * Hook to upload a CSV file and receive the analysis.
 *
 * Backend expects multipart/form-data with field name "file".
 */
export const useAnalyzeCsv = (
  options?: Omit<
    UseMutationOptions<AnalyzeResponse, TradeHabitApiError, File>,
    "mutationFn"
  >,
) => {
  const qc = useQueryClient();

  return useMutation<AnalyzeResponse, TradeHabitApiError, File>({
    ...options,
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post<AnalyzeResponse>("/api/analyze", formData);
    },
    onSuccess: (data, variables, context) => {
      // First let the caller run (may set ready flag, close modals, etc.)
      options?.onSuccess?.(data, variables, context as any);

      // Then, in the next event-loop tick, invalidate cached queries so
      // components that are now mounted will fetch the fresh data only once.
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["summary"] });
        qc.invalidateQueries({ queryKey: ["trades"] });
        qc.invalidateQueries({ queryKey: ["losses"] });
        qc.invalidateQueries({ queryKey: ["insights"] });
        qc.invalidateQueries({ queryKey: ["goals"] });
      }, 0);
    },
  });
};

/**
 * Hook to fetch account/trading summary.
 */
export const useSummary = (enabled: boolean = true) =>
  useQuery<SummaryResponse, TradeHabitApiError>({
    queryKey: ["summary"],
    queryFn: () => apiClient.get<SummaryResponse>("/api/summary"),
    enabled,
  });

/**
 * Hook to fetch all trades (and date range)
 */
export const useTrades = (enabled: boolean = true) =>
  useQuery<TradesResponse, TradeHabitApiError>({
    queryKey: ["trades"],
    queryFn: () => apiClient.get<TradesResponse>("/api/trades"),
    enabled,
  });

/**
 * Hook to fetch loss consistency data
 */
export const useLosses = (enabled: boolean = true) =>
  useQuery<LossesResponse, TradeHabitApiError>({
    queryKey: ["losses"],
    queryFn: () => apiClient.get<LossesResponse>("/api/losses"),
    enabled,
  });

/**
 * Hook to fetch trading insights (ordered by priority from backend)
 */
export const useInsights = (enabled: boolean = true) =>
  useQuery<Insights[], TradeHabitApiError>({
    queryKey: ["insights"],
    queryFn: () => apiClient.get<Insights[]>("/api/insights"),
    enabled,
  });

/**
 * Hook to fetch goals progress
 */
export const useGoals = (enabled: boolean = true) =>
  useQuery<Goals[], TradeHabitApiError>({
    queryKey: ["goals"],
    queryFn: () => apiClient.get<Goals[]>("/api/goals"),
    enabled,
  });