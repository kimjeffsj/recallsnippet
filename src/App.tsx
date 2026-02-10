import { useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { useSettings } from "./hooks/useSettings";

function App() {
  const { data: settings } = useSettings();

  useEffect(() => {
    const theme = settings?.theme ?? "dark";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.theme]);

  return <HomePage />;
}

export default App;
