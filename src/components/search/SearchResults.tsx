import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SearchResult } from "@/lib/types";

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function SearchResults({
  results,
  onSelect,
  isLoading = false,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Searching...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No results found.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        {results.map((result) => (
          <button
            key={result.snippet.id}
            type="button"
            onClick={() => onSelect(result.snippet.id)}
            className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">
                {result.snippet.title}
              </h3>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {Math.round(result.score * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {result.snippet.problem}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {result.snippet.codeLanguage && (
                <Badge variant="secondary" className="text-xs">
                  {result.snippet.codeLanguage}
                </Badge>
              )}
              {result.snippet.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
