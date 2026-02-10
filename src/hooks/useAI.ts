import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/lib/tauri";

export function useOllamaStatus() {
  return useQuery({
    queryKey: ["ollama-status"],
    queryFn: () => aiApi.checkConnection(),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useGenerateSolution() {
  return useMutation({
    mutationFn: (problem: string) => aiApi.generateSolution(problem),
  });
}

export function useSuggestTags() {
  return useMutation({
    mutationFn: (content: string) => aiApi.suggestTags(content),
  });
}

