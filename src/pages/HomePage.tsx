import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SnippetList } from "@/components/snippet/SnippetList";
import { SnippetDetail } from "@/components/snippet/SnippetDetail";
import { SnippetForm } from "@/components/snippet/SnippetForm";
import { SpotlightChat } from "@/components/ai/SpotlightChat";
import {
  useSnippets,
  useSnippet,
  useCreateSnippet,
  useUpdateSnippet,
  useDeleteSnippet,
  usePermanentDeleteSnippet,
  useRestoreSnippet,
} from "@/hooks/useSnippets";
import { useTags } from "@/hooks/useTags";
import {
  AppProvider,
  useAppState,
  useAppDispatch,
} from "@/contexts/AppContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type {
  CreateSnippetInput,
  SnippetContext,
  SnippetFilter,
} from "@/lib/types";

function HomeContent() {
  const { view, selectedId, filterLanguage, activeFolder } = useAppState();
  const dispatch = useAppDispatch();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightContext, setSpotlightContext] = useState<
    SnippetContext | undefined
  >();

  const filter: SnippetFilter = {
    language: filterLanguage,
    favoritesOnly: activeFolder === "favorites" ? true : undefined,
    trashOnly: activeFolder === "trash" ? true : undefined,
    recentFirst: activeFolder === "recent" ? true : undefined,
  };

  const { data: snippets = [], isLoading: snippetsLoading } =
    useSnippets(filter);
  const { data: selectedSnippet } = useSnippet(selectedId);
  const { data: tags = [] } = useTags();

  const createMutation = useCreateSnippet();
  const updateMutation = useUpdateSnippet();
  const deleteMutation = useDeleteSnippet();
  const permanentDeleteMutation = usePermanentDeleteSnippet();
  const restoreMutation = useRestoreSnippet();

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
    if (activeFolder === "trash") {
      if (
        window.confirm(
          "Are you sure you want to permanently delete this snippet? This action cannot be undone.",
        )
      ) {
        permanentDeleteMutation.mutate(id, {
          onSuccess: () => {
            dispatch({ type: "DESELECT_SNIPPET" });
          },
        });
      }
    } else {
      if (window.confirm("Are you sure you want to move this snippet to trash?")) {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            dispatch({ type: "DESELECT_SNIPPET" });
          },
        });
      }
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id, {
      onSuccess: () => {
        dispatch({ type: "DESELECT_SNIPPET" });
      },
    });
  };

  const openSpotlight = useCallback((context?: SnippetContext) => {
    setSpotlightContext(context);
    setSpotlightOpen(true);
  }, []);

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
    onSpotlight: () => openSpotlight(),
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
            onNavigateToSnippet={handleSelect}
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
            onNavigateToSnippet={handleSelect}
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
            onRestore={handleRestore}
            onBack={handleBack}
            onAskAI={() =>
              openSpotlight({
                title: selectedSnippet.title,
                problem: selectedSnippet.problem,
                solution: selectedSnippet.solution ?? undefined,
                code: selectedSnippet.code ?? undefined,
              })
            }
          />
        );

      default:
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

  return (
    <>
      <MainLayout>{renderContent()}</MainLayout>
      <SpotlightChat
        open={spotlightOpen}
        onOpenChange={setSpotlightOpen}
        onSelectSnippet={handleSelect}
        snippetContext={spotlightContext}
      />
    </>
  );
}

export function HomePage() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
