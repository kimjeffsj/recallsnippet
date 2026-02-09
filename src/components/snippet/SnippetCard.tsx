import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SnippetSummary } from "@/lib/types";

interface SnippetCardProps {
  snippet: SnippetSummary;
  onClick: (id: string) => void;
  isSelected?: boolean;
}

export function SnippetCard({
  snippet,
  onClick,
  isSelected = false,
}: SnippetCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(snippet.id)}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-colors",
        "hover:bg-accent/50",
        isSelected
          ? "border-primary bg-accent/30"
          : "border-border bg-card",
      )}
    >
      <h3 className="font-semibold text-sm truncate">{snippet.title}</h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {snippet.problem}
      </p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {snippet.codeLanguage && (
          <Badge variant="secondary" className="text-xs">
            {snippet.codeLanguage}
          </Badge>
        )}
        {snippet.tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-xs">
            {tag.name}
          </Badge>
        ))}
      </div>
    </button>
  );
}
