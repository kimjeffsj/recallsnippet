import { ScrollArea } from "@/components/ui/scroll-area";
import { SnippetCard } from "./SnippetCard";
import type { SnippetSummary } from "@/lib/types";

interface SnippetListProps {
  snippets: SnippetSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function SnippetList({
  snippets,
  selectedId,
  onSelect,
  isLoading = false,
}: SnippetListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No snippets yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        {snippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            onClick={onSelect}
            isSelected={snippet.id === selectedId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
