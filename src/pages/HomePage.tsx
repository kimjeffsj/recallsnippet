import { MainLayout } from "@/components/layout/MainLayout";
import { SnippetList } from "@/components/snippet/SnippetList";
import { SnippetDetail } from "@/components/snippet/SnippetDetail";
import { SnippetForm } from "@/components/snippet/SnippetForm";
import { SearchResults } from "@/components/search/SearchResults";
import {
  useSnippets,
  useSnippet,
  useCreateSnippet,
  useUpdateSnippet,
  useDeleteSnippet,
} from "@/hooks/useSnippets";
import { useTags } from "@/hooks/useTags";
import { useSemanticSearch } from "@/hooks/useSearch";
import {
  AppProvider,
  useAppState,
  useAppDispatch,
} from "@/contexts/AppContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { CreateSnippetInput } from "@/lib/types";

function HomeContent() {
  const { view, selectedId, searchQuery, filterLanguage } = useAppState();
  const dispatch = useAppDispatch();

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
    dispatch({ type: "SELECT_SNIPPET", id });
  };

  const handleCreate = (data: CreateSnippetInput) => {
    createMutation.mutate(data, {
      onSuccess: (created) => {
        dispatch({ type: "SELECT_SNIPPET", id: created.id });
      },
    });
  };

  const handleUpdate = (data: CreateSnippetInput) => {
    if (!selectedId) return;
    updateMutation.mutate(
      { id: selectedId, input: data },
      {
        onSuccess: () => {
          dispatch({ type: "SET_VIEW", view: "detail" });
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        dispatch({ type: "DESELECT_SNIPPET" });
      },
    });
  };

  useKeyboardShortcuts({
    onNewSnippet: () => dispatch({ type: "NAVIGATE_TO_CREATE" }),
    onEscape: () => {
      if (view !== "list") {
        if (view === "detail") {
          dispatch({ type: "NAVIGATE_TO_LIST" });
        } else if (selectedId) {
          dispatch({ type: "SET_VIEW", view: "detail" });
        } else {
          dispatch({ type: "NAVIGATE_TO_LIST" });
        }
      }
    },
  });

  const handleBack = () => {
    if (view === "detail") {
      dispatch({ type: "NAVIGATE_TO_LIST" });
    } else {
      if (selectedId) {
        dispatch({ type: "SET_VIEW", view: "detail" });
      } else {
        dispatch({ type: "NAVIGATE_TO_LIST" });
      }
    }
  };

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
            onEdit={() => dispatch({ type: "SET_VIEW", view: "edit" })}
            onDelete={handleDelete}
            onBack={handleBack}
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
                    Run{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      ollama serve
                    </code>{" "}
                    to enable semantic search.
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

  return <MainLayout>{renderContent()}</MainLayout>;
}

export function HomePage() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
