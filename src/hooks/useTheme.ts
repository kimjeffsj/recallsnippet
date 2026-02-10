import { useCallback, useEffect } from "react";
import { useSettings, useUpdateSettings } from "./useSettings";

export function useTheme() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const theme = settings?.theme ?? "dark";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    updateSettings.mutate({ theme: newTheme });
  }, [theme, updateSettings]);

  return { theme, toggleTheme };
}
