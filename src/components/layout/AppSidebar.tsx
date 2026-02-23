import { Badge } from "@/components/ui/badge";
import { useAppState, useAppDispatch, type Folder } from "@/contexts/AppContext";
import { useSnippets } from "@/hooks/useSnippets";
import { useOllamaStatus } from "@/hooks/useAI";
import { useSettings } from "@/hooks/useSettings";
import { getLanguageInfo } from "@/lib/language-colors";
import { Library, Star, Clock, Trash2, Sparkles } from "lucide-react";

export function AppSidebar() {
  const { filterLanguage, activeFolder } = useAppState();
  const dispatch = useAppDispatch();
  const { data: snippets = [] } = useSnippets();
  const { data: isConnected } = useOllamaStatus();
  const { data: settings } = useSettings();

  const languages = [
    ...new Set(
      snippets
        .map((s) => s.codeLanguage?.toLowerCase())
        .filter(Boolean) as string[],
    ),
  ];

  const navItems = [
    {
      icon: Library,
      label: "Library",
      folder: "library" as Folder,
    },
    {
      icon: Star,
      label: "Starred",
      folder: "favorites" as Folder,
    },
    {
      icon: Clock,
      label: "Recent",
      folder: "recent" as Folder,
    },
    {
      icon: Trash2,
      label: "Trash",
      folder: "trash" as Folder,
    },
  ];

  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col justify-between overflow-y-auto shrink-0">
      <div className="p-3 space-y-5">
        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, folder }) => {
            const isActive = activeFolder === folder && !filterLanguage;
            return (
              <button
                key={label}
                onClick={() =>
                  dispatch({ type: "SET_ACTIVE_FOLDER", folder })
                }
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-3">
              Languages
            </h3>
            <div className="flex flex-wrap gap-1.5 px-1">
              <button
                onClick={() =>
                  dispatch({
                    type: "SET_FILTER_LANGUAGE",
                    language: undefined,
                  })
                }
                className="inline-flex"
              >
                <Badge
                  variant={!filterLanguage ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                >
                  All
                </Badge>
              </button>
              {languages.map((lang) => {
                const { color, abbr } = getLanguageInfo(lang);
                return (
                  <button
                    key={lang}
                    onClick={() =>
                      dispatch({
                        type: "SET_FILTER_LANGUAGE",
                        language: filterLanguage === lang ? undefined : lang,
                      })
                    }
                    className="inline-flex"
                  >
                    <Badge
                      variant={filterLanguage === lang ? "default" : "outline"}
                      className="cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {abbr}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer - AI Section */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Ollama Status - clickable to open Settings */}
        <button
          onClick={() => dispatch({ type: "SET_SETTINGS_OPEN", open: true })}
          className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted hover:bg-accent transition-colors text-left"
          data-testid="model-card"
        >
          <div className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="relative overflow-hidden">
            <div className="transition-all duration-200 ease-in-out group-hover:opacity-0 group-hover:-translate-y-1">
              <p className="text-xs font-semibold">Ollama AI</p>
              <p className="text-[10px] text-muted-foreground">
                {settings?.llmModel ?? "Loading..."}
              </p>
            </div>
            <div className="absolute inset-0 flex items-center opacity-0 translate-y-1 transition-all duration-200 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
              <p className="text-xs font-semibold text-primary">Settings</p>
            </div>
          </div>
        </button>

        {/* Ask AI Hint */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Ask AI</span>
          </div>
          <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            ⌘J
          </kbd>
        </div>
      </div>
    </aside>
  );
}
