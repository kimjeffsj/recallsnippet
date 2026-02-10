import { FileText } from "lucide-react";
import type { SnippetSource } from "@/lib/types";

interface SourceCardsProps {
  sources: SnippetSource[];
  onSelect: (id: string) => void;
}

export function SourceCards({ sources, onSelect }: SourceCardsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        Sources
      </span>
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() => onSelect(source.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20"
        >
          <FileText className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{source.title}</span>
          <span className="text-primary/60">{Math.round(source.score * 100)}%</span>
        </button>
      ))}
    </div>
  );
}
