import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AnalyzeResponse, SummaryResponse, TradesResponse, LossesResponse, Insights, Goals, ExcessiveRiskResponse } from "./types";
import { TradeHabitApiError } from "./client";
import { useGoalsStore, seedDefaultGoals } from "@/state/goalsStore";
import { useSettingsStore } from "@/state/settingsStore";

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
      // Clear session goals and seed defaults for new dataset
      useGoalsStore.getState().setGoals([]);
      seedDefaultGoals();

      // Reset saved thresholds to defaults on new dataset
      useSettingsStore.getState().reset();

      // Remove all cached query data to force fresh fetches
      qc.removeQueries({ queryKey: ["summary"] });
      qc.removeQueries({ queryKey: ["trades"] });
      qc.removeQueries({ queryKey: ["losses"] });
      qc.removeQueries({ queryKey: ["insights"] });
      qc.removeQueries({ queryKey: ["excessive-risk"] });
      qc.removeQueries({ queryKey: ["goals"] });

      // Let the caller run (sets ready flag, which will trigger new fetches)
      options?.onSuccess?.(data, variables, context as any);
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
    refetchOnMount: "always",
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
 * Hook to fetch excessive risk stats
 */
export const useExcessiveRisk = (enabled: boolean = true) =>
  useQuery<ExcessiveRiskResponse, TradeHabitApiError>({
    queryKey: ["excessive-risk"],
    queryFn: () => apiClient.get<ExcessiveRiskResponse>("/api/excessive-risk"),
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