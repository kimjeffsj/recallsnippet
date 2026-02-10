import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";
import { searchApi } from "@/lib/tauri";
import { getLanguageInfo } from "@/lib/language-colors";
import type { SearchResult } from "@/lib/types";

interface SpotlightChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSnippet: (id: string) => void;
  initialQuery?: string;
}

export function SpotlightChat({
  open,
  onOpenChange,
  onSelectSnippet,
  initialQuery,
}: SpotlightChatProps) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Focus input when dialog opens, reset on close
  useEffect(() => {
    if (open) {
      const query = initialQuery ?? "";
      setInput(query);
      setResults([]);
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      if (query.length > 2) {
        performSearch(query);
      }
    }
  }, [open, initialQuery]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length <= 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchApi.semantic(query, 10);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelect = (id: string) => {
    onSelectSnippet(id);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      performSearch(input);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Find Related Snippets</DialogTitle>
        <DialogDescription className="sr-only">
          Search your knowledge base for related snippets
        </DialogDescription>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Find Related</h3>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ⌘J
          </kbd>
        </div>

        {/* Search Input */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search your knowledge base..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
          <div className="p-2">
            {!hasSearched && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Search your snippets</p>
                <p className="text-xs mt-1">
                  Find related snippets using semantic search
                </p>
              </div>
            )}
            {hasSearched && !isSearching && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No related snippets found</p>
                <p className="text-xs mt-1">Try a different search query</p>
              </div>
            )}
            {results.map((result) => {
              const langInfo = getLanguageInfo(result.snippet.codeLanguage);
              const score = Math.round(result.score * 100);
              return (
                <button
                  key={result.snippet.id}
                  onClick={() => handleSelect(result.snippet.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {result.snippet.title}
                        </h4>
                        {result.snippet.codeLanguage && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0"
                            style={{
                              backgroundColor: `${langInfo.color}15`,
                              color: langInfo.color,
                              borderColor: `${langInfo.color}30`,
                            }}
                          >
                            {langInfo.abbr}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.snippet.problem}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5">
                      {score}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
