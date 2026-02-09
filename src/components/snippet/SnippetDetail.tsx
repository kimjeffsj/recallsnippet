import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "./CodeBlock";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import type { Snippet } from "@/lib/types";

interface SnippetDetailProps {
  snippet: Snippet;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SnippetDetail({
  snippet,
  onEdit,
  onDelete,
}: SnippetDetailProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{snippet.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {snippet.codeLanguage && (
              <Badge variant="secondary">{snippet.codeLanguage}</Badge>
            )}
            {snippet.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(snippet.id)}
            aria-label="Edit snippet"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(snippet.id)}
            aria-label="Delete snippet"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">
          Problem
        </h2>
        <p className="text-sm whitespace-pre-wrap">{snippet.problem}</p>
      </section>

      {snippet.solution && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            Solution
          </h2>
          <p className="text-sm whitespace-pre-wrap">{snippet.solution}</p>
        </section>
      )}

      {snippet.code && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            Code
          </h2>
          <CodeBlock
            code={snippet.code}
            language={snippet.codeLanguage ?? undefined}
          />
        </section>
      )}

      {snippet.referenceUrl && (
        <section className="mt-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            Reference
          </h2>
          <a
            href={snippet.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            {snippet.referenceUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </section>
      )}

      <div className="mt-6 text-xs text-muted-foreground">
        Created: {snippet.createdAt} | Updated: {snippet.updatedAt}
      </div>
    </div>
  );
}
