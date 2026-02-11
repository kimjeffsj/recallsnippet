import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CodeBlock } from "./CodeBlock";
import { getLanguageInfo } from "@/lib/language-colors";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import type { Snippet } from "@/lib/types";

interface SnippetDetailProps {
  snippet: Snippet;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onBack?: () => void;
  onAskAI?: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function SnippetDetail({
  snippet,
  onEdit,
  onDelete,
  onBack,
  onAskAI,
}: SnippetDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const langInfo = getLanguageInfo(snippet.codeLanguage);

  return (
    <div className="p-6 lg:p-8 overflow-y-auto h-full">
      {/* Header: Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Go back"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <nav className="flex items-center text-sm text-muted-foreground gap-1">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Library
            </span>
            {snippet.codeLanguage && (
              <>
                <span className="text-muted-foreground/50 mx-1">/</span>
                <span className="text-foreground capitalize">{snippet.codeLanguage}</span>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(snippet.id)}
            aria-label="Edit snippet"
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label="Delete snippet"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Title + badges */}
          <div className="space-y-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              {snippet.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {snippet.codeLanguage && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium border capitalize"
                  style={{
                    backgroundColor: `${langInfo.color}15`,
                    color: langInfo.color,
                    borderColor: `${langInfo.color}30`,
                  }}
                >
                  {snippet.codeLanguage}
                </span>
              )}
              {snippet.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Problem */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Problem
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {snippet.problem}
            </p>
          </section>

          {/* Solution */}
          {snippet.solution && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Solution
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {snippet.solution}
              </p>
            </section>
          )}

          {/* Code */}
          {snippet.code && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Code
              </h2>
              <CodeBlock
                code={snippet.code}
                language={snippet.codeLanguage ?? undefined}
                filename={
                  snippet.codeLanguage
                    ? `snippet.${snippet.codeLanguage}`
                    : undefined
                }
              />
            </section>
          )}

          {/* Ask AI Bar */}
          <div className="bg-muted border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ask AI
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ask questions about this snippet using your knowledge base.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAskAI}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* Right column: Metadata sidebar */}
        <aside className="lg:w-72 xl:w-80 space-y-6 shrink-0">
          {/* Metadata card */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created {formatDate(snippet.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDate(snippet.updatedAt)}</span>
              </div>
              {snippet.referenceUrl && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
                  <a
                    href={snippet.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all text-xs"
                  >
                    {snippet.referenceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tags card */}
          {snippet.tags.length > 0 && (
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete snippet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{snippet.title}". This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(snippet.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
