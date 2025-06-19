import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AnalyzeResponse, SummaryResponse } from "./types";
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
  return useMutation<AnalyzeResponse, TradeHabitApiError, File>({
    ...options,
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post<AnalyzeResponse>("/api/analyze", formData);
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