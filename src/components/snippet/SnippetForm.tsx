import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Snippet, CreateSnippetInput, Tag } from "@/lib/types";

interface SnippetFormProps {
  snippet?: Snippet;
  availableTags: Tag[];
  onSubmit: (data: CreateSnippetInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SnippetForm({
  snippet,
  availableTags,
  onSubmit,
  onCancel,
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

  const isValid = title.trim().length > 0 && problem.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">
        {snippet ? "Edit Snippet" : "New Snippet"}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem">Problem *</Label>
        <Textarea
          id="problem"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Describe the problem you encountered"
          rows={4}
          required
        />
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste relevant code"
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="codeLanguage">Language</Label>
        <Input
          id="codeLanguage"
          value={codeLanguage}
          onChange={(e) => setCodeLanguage(e.target.value)}
          placeholder="e.g. typescript, rust, python"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceUrl">Reference URL</Label>
        <Input
          id="referenceUrl"
          value={referenceUrl}
          onChange={(e) => setReferenceUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex"
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {tag.name}
                    {isSelected && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "Saving..." : snippet ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
