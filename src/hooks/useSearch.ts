import { useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/tauri";

export function useSemanticSearch(query: string) {
  const deferredQuery = useDeferredValue(query);

  return useQuery({
    queryKey: ["search", deferredQuery],
    queryFn: () => searchApi.semantic(deferredQuery, 10),
    enabled: deferredQuery.length > 2,
    staleTime: 1000 * 60,
  });
}
