import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Loader2, X, Save, AlertTriangle } from "lucide-react";
import { useSuggestTags, useOllamaStatus } from "@/hooks/useAI";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { searchApi } from "@/lib/tauri";
import type { Snippet, CreateSnippetInput, Tag, SearchResult } from "@/lib/types";

interface SnippetFormProps {
  snippet?: Snippet;
  availableTags: Tag[];
  onSubmit: (data: CreateSnippetInput) => void;
  onCancel: () => void;
  onNavigateToSnippet?: (id: string) => void;
  isLoading?: boolean;
}

export function SnippetForm({
  snippet,
  availableTags,
  onSubmit,
  onCancel,
  onNavigateToSnippet,
  isLoading = false,
}: SnippetFormProps) {
  const [title, setTitle] = useState(snippet?.title ?? "");
  const [problem, setProblem] = useState(snippet?.problem ?? "");
  const [solution, setSolution] = useState(snippet?.solution ?? "");
  const [code, setCode] = useState(snippet?.code ?? "");
  const [codeLanguage, setCodeLanguage] = useState(
    snippet?.codeLanguage ?? "",
  );
  const [referenceUrl, setReferenceUrl] = useState(
    snippet?.referenceUrl ?? "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    snippet?.tags.map((t) => t.id) ?? [],
  );
  const [aiError, setAiError] = useState<string | null>(null);
  const [similarSnippets, setSimilarSnippets] = useState<SearchResult[]>([]);

  const { data: ollamaConnected = false } = useOllamaStatus();
  const suggestTags = useSuggestTags();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const checkDuplicates = useCallback(
    (searchText: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (searchText.length < 5) {
        setSimilarSnippets([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await searchApi.semantic(searchText, 3);
          const filtered = results.filter(
            (r) => r.score > 0.5 && r.snippet.id !== snippet?.id,
          );
          setSimilarSnippets(filtered);
        } catch {
          // Silently ignore - Ollama may not be running
        }
      }, 500);
    },
    [snippet?.id],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    checkDuplicates(`${value} ${problem}`);
  };

  const handleProblemChange = (value: string) => {
    setProblem(value);
    checkDuplicates(`${title} ${value}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      problem: problem.trim(),
      solution: solution.trim() || undefined,
      code: code.trim() || undefined,
      codeLanguage: codeLanguage.trim() || undefined,
      referenceUrl: referenceUrl.trim() || undefined,
      tagIds: selectedTagIds,
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSuggestTags = () => {
    const content = `${title} ${problem} ${solution}`.trim();
    if (!content) return;
    setAiError(null);
    suggestTags.mutate(content, {
      onSuccess: (suggested) => {
        const matchedIds = availableTags
          .filter((tag) =>
            suggested.some(
              (s) => s.toLowerCase() === tag.name.toLowerCase(),
            ),
          )
          .map((tag) => tag.id);
        if (matchedIds.length > 0) {
          setSelectedTagIds((prev) => [
            ...new Set([...prev, ...matchedIds]),
          ]);
        }
      },
      onError: () => {
        setAiError("Failed to suggest tags. Is Ollama running?");
      },
    });
  };

  const isValid = title.trim().length > 0 && problem.trim().length > 0;
  const isSuggesting = suggestTags.isPending;

  return (
    <div className="p-6 lg:p-8 overflow-y-auto h-full">
      {/* Header: Back + Title + Save */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Go back"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">
            {snippet ? "Edit Snippet" : "New Snippet"}
          </h2>
        </div>
        <Button
          type="submit"
          form="snippet-form"
          disabled={!isValid || isLoading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : snippet ? "Update" : "Create"}
        </Button>
      </div>

      {aiError && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-6" role="alert">
          {aiError}
        </div>
      )}

      {similarSnippets.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6" data-testid="duplicate-banner">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">
              Similar snippets found
            </span>
          </div>
          <ul className="space-y-1">
            {similarSnippets.map((result) => (
              <li key={result.snippet.id}>
                <button
                  type="button"
                  onClick={() => onNavigateToSnippet?.(result.snippet.id)}
                  className="text-sm text-primary hover:underline"
                >
                  {result.snippet.title} (Relevance {Math.round(result.score * 100)}%)
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form id="snippet-form" onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Title + Language row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codeLanguage">Language</Label>
            <Input
              id="codeLanguage"
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              placeholder="e.g. typescript"
            />
          </div>
        </div>

        {/* Problem */}
        <div className="space-y-2">
          <Label htmlFor="problem">Problem *</Label>
          <Textarea
            id="problem"
            value={problem}
            onChange={(e) => handleProblemChange(e.target.value)}
            placeholder="Describe the problem you encountered"
            rows={3}
            required
          />
        </div>

        {/* Solution */}
        <div className="space-y-2">
          <Label htmlFor="solution">Solution</Label>
          <Textarea
            id="solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="How you solved it"
            rows={4}
          />
        </div>

        {/* Code */}
        <div className="space-y-2">
          <Label>Code</Label>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={codeLanguage}
            placeholder="Paste relevant code"
          />
        </div>

        {/* Reference URL */}
        <div className="space-y-2">
          <Label htmlFor="referenceUrl">Reference URL</Label>
          <Input
            id="referenceUrl"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              {ollamaConnected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestTags}
                  disabled={isSuggesting || (!title.trim() && !problem.trim())}
                  aria-label="Suggest tags with AI"
                  className="gap-1.5 text-xs"
                >
                  {isSuggesting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {isSuggesting ? "Suggesting..." : "AI Tags"}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {tag.name}
                    {isSelected && <X className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
