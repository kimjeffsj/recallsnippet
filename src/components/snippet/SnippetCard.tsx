import { cn } from "@/lib/utils";
import { getLanguageInfo } from "@/lib/language-colors";
import { Star, Trash2, RefreshCw } from "lucide-react";
import type { SnippetSummary } from "@/lib/types";
import { useToggleFavorite } from "@/hooks/useSnippets";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface SnippetCardProps {
  snippet: SnippetSummary;
  onClick: (id: string) => void;
  onRestore?: (id: string, e: React.MouseEvent) => void;
  isSelected?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function SnippetCard({
  snippet,
  onClick,
  onRestore,
  isSelected = false,
}: SnippetCardProps) {
  const langInfo = getLanguageInfo(snippet.codeLanguage);
  const toggleFavoriteMutation = useToggleFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate(snippet.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(snippet.id);
        }
      }}
      onClick={() => onClick(snippet.id)}
      className={cn(
        "group relative bg-card border rounded-xl text-left",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50",
        "transition-all duration-300 overflow-hidden flex flex-col",
        isSelected
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border",
        snippet.isDeleted && "opacity-70 bg-muted/50",
      )}
    >
      {/* Body */}
      <div className="p-5 flex-1 w-full">
        {/* Header: Language badge + Title + Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-8 w-8 rounded flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${langInfo.color}15` }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: langInfo.color }}
              >
                {langInfo.abbr}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {snippet.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {snippet.isFavorite && (
              <button 
                type="button"
                onClick={handleToggleFavorite}
                className="hover:scale-110 transition-transform focus:outline-none"
                aria-label="Remove from starred"
              >
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </button>
            )}
            {!snippet.isFavorite && !snippet.isDeleted && (
               <button 
               type="button"
               onClick={handleToggleFavorite}
               className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all focus:outline-none text-muted-foreground hover:text-yellow-500 focus:opacity-100"
               aria-label="Add to starred"
             >
               <Star className="h-4 w-4" />
             </button>
            )}
            {snippet.isDeleted && onRestore && (
              <button
                type="button"
                onClick={(e) => onRestore(snippet.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all focus:outline-none text-green-500/70 hover:text-green-500 focus:opacity-100 bg-green-500/10 p-1.5 rounded-md"
                title="Restore Snippet"
                aria-label="Restore Snippet"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            {snippet.isDeleted && !onRestore && (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>

        {/* Problem description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {snippet.problem}
        </p>

        {/* Code preview */}
        {snippet.codePreview && (
          <div className="relative rounded-lg border border-border group-hover:border-muted-foreground/20 transition-colors overflow-hidden max-h-[120px] bg-[#282c34]">
            <SyntaxHighlighter
              language={snippet.codeLanguage || "text"}
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {snippet.codePreview}
            </SyntaxHighlighter>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#282c34] to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Footer: Tags + Time */}
      <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center gap-2 w-full">
        {snippet.tags.slice(0, 3).map((tag) => (
          <span
            key={tag.id}
            className="text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
          >
            #{tag.name}
          </span>
        ))}
        {snippet.tags.length > 3 && (
          <span className="text-[10px] text-muted-foreground">
            +{snippet.tags.length - 3}
          </span>
        )}
        <div className="ml-auto text-[10px] text-muted-foreground">
          {timeAgo(snippet.createdAt)}
        </div>
      </div>
    </div>
  );
}
