import { Badge } from "@/components/ui/badge";
import { useAppState, useAppDispatch } from "@/contexts/AppContext";
import { useSnippets } from "@/hooks/useSnippets";
import { useOllamaStatus } from "@/hooks/useAI";
import { useSettings } from "@/hooks/useSettings";
import { getLanguageInfo } from "@/lib/language-colors";
import { Library, Heart, Clock, Trash2 } from "lucide-react";

export function AppSidebar() {
  const { filterLanguage, view } = useAppState();
  const dispatch = useAppDispatch();
  const { data: snippets = [] } = useSnippets();
  const { data: isConnected } = useOllamaStatus();
  const { data: settings } = useSettings();

  const languages = [
    ...new Set(
      snippets.map((s) => s.codeLanguage).filter(Boolean) as string[],
    ),
  ];

  const navItems = [
    {
      icon: Library,
      label: "Library",
      active: view === "list" && !filterLanguage,
      onClick: () => dispatch({ type: "NAVIGATE_TO_LIST" }),
    },
    {
      icon: Heart,
      label: "Favorites",
      active: false,
      onClick: () => {},
      disabled: true,
    },
    {
      icon: Clock,
      label: "Recent",
      active: false,
      onClick: () => {},
      disabled: true,
    },
    {
      icon: Trash2,
      label: "Trash",
      active: false,
      onClick: () => {},
      disabled: true,
    },
  ];

  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col justify-between overflow-y-auto shrink-0">
      <div className="p-3 space-y-5">
        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, active, onClick, disabled }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : disabled
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
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

      {/* Footer - Ollama Status */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted">
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
          <div>
            <p className="text-xs font-semibold">Ollama AI</p>
            <p className="text-[10px] text-muted-foreground">
              {settings?.llmModel ?? "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
