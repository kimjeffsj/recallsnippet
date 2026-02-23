import { SnippetCard } from "./SnippetCard";
import type { SnippetSummary } from "@/lib/types";

interface SnippetListProps {
  snippets: SnippetSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRestore?: (id: string, e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export function SnippetList({
  snippets,
  selectedId,
  onSelect,
  onRestore,
  isLoading = false,
}: SnippetListProps) {
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
                <div className="h-20 rounded-lg bg-muted" />
              </div>
              <div className="px-5 py-3 border-t border-border bg-muted/30">
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No snippets yet</p>
          <p className="text-sm">Create your first snippet to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Snippets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {snippets.length} snippet{snippets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {snippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            onClick={onSelect}
            onRestore={onRestore}
            isSelected={snippet.id === selectedId}
          />
        ))}
      </div>
    </div>
  );
}
