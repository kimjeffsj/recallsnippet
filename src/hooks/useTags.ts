import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagApi } from "@/lib/tauri";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => tagApi.list(),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => tagApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
  });
}
