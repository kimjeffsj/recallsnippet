import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SnippetList } from "@/components/snippet/SnippetList";
import { SnippetDetail } from "@/components/snippet/SnippetDetail";
import { SnippetForm } from "@/components/snippet/SnippetForm";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useSnippets,
  useSnippet,
  useCreateSnippet,
  useUpdateSnippet,
  useDeleteSnippet,
} from "@/hooks/useSnippets";
import { useTags } from "@/hooks/useTags";
import { useSemanticSearch } from "@/hooks/useSearch";
import { Plus } from "lucide-react";
import type { CreateSnippetInput } from "@/lib/types";

type View = "list" | "create" | "edit" | "detail";

export function HomePage() {
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: snippets = [], isLoading: snippetsLoading } = useSnippets(
    filterLanguage ? { language: filterLanguage } : undefined,
  );
  const { data: selectedSnippet } = useSnippet(selectedId);
  const { data: tags = [] } = useTags();
  const {
    data: searchResults = [],
    isLoading: searchLoading,
    isError: searchError,
  } = useSemanticSearch(searchQuery);

  const isSearching = searchQuery.length > 2;

  const createMutation = useCreateSnippet();
  const updateMutation = useUpdateSnippet();
  const deleteMutation = useDeleteSnippet();

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const handleCreate = (data: CreateSnippetInput) => {
    createMutation.mutate(data, {
      onSuccess: (created) => {
        setSelectedId(created.id);
        setView("detail");
      },
    });
  };

  const handleUpdate = (data: CreateSnippetInput) => {
    if (!selectedId) return;
    updateMutation.mutate(
      { id: selectedId, input: data },
      {
        onSuccess: () => {
          setView("detail");
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setSelectedId(null);
        setView("list");
      },
    });
  };

  const handleBack = () => {
    if (view === "detail") {
      setView("list");
    } else {
      setView(selectedId ? "detail" : "list");
    }
  };

  // Collect unique languages for filter sidebar
  const languages = [
    ...new Set(
      snippets.map((s) => s.codeLanguage).filter(Boolean) as string[],
    ),
  ];

  const sidebar = (
    <div className="space-y-4">
      <Button
        className="w-full"
        onClick={() => {
          setSelectedId(null);
          setView("create");
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Snippet
      </Button>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {languages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Languages
          </h3>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setFilterLanguage(undefined)}
              className="inline-flex"
            >
              <Badge
                variant={!filterLanguage ? "default" : "outline"}
                className="cursor-pointer text-xs"
              >
                All
              </Badge>
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() =>
                  setFilterLanguage(filterLanguage === lang ? undefined : lang)
                }
                className="inline-flex"
              >
                <Badge
                  variant={filterLanguage === lang ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                >
                  {lang}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case "create":
        return (
          <SnippetForm
            availableTags={tags}
            onSubmit={handleCreate}
            onCancel={handleBack}
            isLoading={createMutation.isPending}
          />
        );

      case "edit":
        if (!selectedSnippet) return null;
        return (
          <SnippetForm
            snippet={selectedSnippet}
            availableTags={tags}
            onSubmit={handleUpdate}
            onCancel={handleBack}
            isLoading={updateMutation.isPending}
          />
        );

      case "detail":
        if (!selectedSnippet) return null;
        return (
          <SnippetDetail
            snippet={selectedSnippet}
            onEdit={() => setView("edit")}
            onDelete={handleDelete}
          />
        );

      default:
        if (isSearching) {
          if (searchError) {
            return (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                  <p>AI search requires Ollama to be running.</p>
                  <p className="text-xs">
                    Run <code className="bg-muted px-1 py-0.5 rounded">ollama serve</code> to enable semantic search.
                  </p>
                </div>
              </div>
            );
          }
          return (
            <SearchResults
              results={searchResults}
              onSelect={handleSelect}
              isLoading={searchLoading}
            />
          );
        }
        return (
          <SnippetList
            snippets={snippets}
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoading={snippetsLoading}
          />
        );
    }
  };

  return <MainLayout sidebar={sidebar}>{renderContent()}</MainLayout>;
}
