import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import type { SearchResult } from "@/lib/types";

interface SearchDropdownProps {
  results: SearchResult[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function SearchDropdown({
  results,
  isLoading,
  isError,
  onSelect,
  onClose,
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (isError) {
    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4"
      >
        <p className="text-sm text-muted-foreground text-center">
          AI search requires Ollama to be running.
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Run <code className="bg-muted px-1 py-0.5 rounded">ollama serve</code> to enable semantic search.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Searching...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span className="text-sm">No results found.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      {results.map((result) => (
        <button
          key={result.snippet.id}
          type="button"
          onClick={() => {
            onSelect(result.snippet.id);
            onClose();
          }}
          className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm truncate">
              {result.snippet.title}
            </h3>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {Math.round(result.score * 100)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {result.snippet.problem}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {result.snippet.codeLanguage && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {result.snippet.codeLanguage}
              </Badge>
            )}
            {result.snippet.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag.name}
              </Badge>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
