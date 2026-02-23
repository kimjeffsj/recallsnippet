import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { snippetApi } from "@/lib/tauri";
import type {
  SnippetFilter,
  CreateSnippetInput,
  UpdateSnippetInput,
} from "@/lib/types";

export function useSnippets(filter?: SnippetFilter) {
  return useQuery({
    queryKey: ["snippets", filter],
    queryFn: () => snippetApi.list(filter),
  });
}

export function useSnippet(id: string | null) {
  return useQuery({
    queryKey: ["snippet", id],
    queryFn: () => snippetApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSnippetInput) => snippetApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
  });
}

export function useUpdateSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSnippetInput }) =>
      snippetApi.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      queryClient.invalidateQueries({ queryKey: ["snippet", id] });
    },
  });
}

export function useDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snippetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snippetApi.toggleFavorite(id),
    onSuccess: (updatedSnippet) => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      queryClient.invalidateQueries({
        queryKey: ["snippet", updatedSnippet.id],
      });
    },
  });
}

export function useRestoreSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snippetApi.restore(id),
    onSuccess: (updatedSnippet) => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      queryClient.invalidateQueries({
        queryKey: ["snippet", updatedSnippet.id],
      });
    },
  });
}

export function usePermanentDeleteSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => snippetApi.deletePermanent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    },
  });
}
