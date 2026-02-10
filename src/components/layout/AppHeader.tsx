import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, useAppDispatch } from "@/contexts/AppContext";
import { Plus, Settings, Search, Code2 } from "lucide-react";

export function AppHeader() {
  const { searchQuery } = useAppState();
  const dispatch = useAppDispatch();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 justify-between shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 w-56">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Code2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">RecallSnippet</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH_QUERY", query: e.target.value })
            }
            placeholder="Search snippets..."
            className="pl-9 pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-56 justify-end">
        <Button
          size="sm"
          onClick={() => dispatch({ type: "NAVIGATE_TO_CREATE" })}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Snippet
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => dispatch({ type: "SET_SETTINGS_OPEN", open: true })}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
