import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AnalyzeResponse, SummaryResponse, TradesResponse, LossesResponse } from "./types";
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
      // Refetch dependent queries so UI updates with freshly analyzed data
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["losses"] });
      // propagate to caller if provided
      options?.onSuccess?.(data, variables, context as any);
    },
  });
};

/**
 * Hook to fetch account/trading summary.
 */
export const useSummary = () =>
  useQuery<SummaryResponse, TradeHabitApiError>({
    queryKey: ["summary"],
    queryFn: () => apiClient.get<SummaryResponse>("/api/summary"),
  });

/**
 * Hook to fetch all trades (and date range)
 */
export const useTrades = () =>
  useQuery<TradesResponse, TradeHabitApiError>({
    queryKey: ["trades"],
    queryFn: () => apiClient.get<TradesResponse>("/api/trades"),
  });

/**
 * Hook to fetch loss consistency data
 */
export const useLosses = () =>
  useQuery<LossesResponse, TradeHabitApiError>({
    queryKey: ["losses"],
    queryFn: () => apiClient.get<LossesResponse>("/api/losses"),
  }); 