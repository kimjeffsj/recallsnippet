import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onNewSnippet?: () => void;
  onEscape?: () => void;
  onSpotlight?: () => void;
}

export function useKeyboardShortcuts({
  onNewSnippet,
  onEscape,
  onSpotlight,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ⌘J / Ctrl+J — Spotlight (works even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        onSpotlight?.();
        return;
      }

      // Don't trigger other shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (e.key === "Escape" && onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // ⌘N / Ctrl+N — New Snippet
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        onNewSnippet?.();
      }

      // Escape — Go back
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewSnippet, onEscape, onSpotlight]);
}
