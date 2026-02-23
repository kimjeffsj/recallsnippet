import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppSidebar } from "./AppSidebar";
import { AppProvider } from "@/contexts/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock hooks
vi.mock("@/hooks/useSnippets", () => ({
  useSnippets: () => ({
    data: [
      { codeLanguage: "rust" },
      { codeLanguage: "typescript" },
      { codeLanguage: "rust" },
    ],
  }),
}));

vi.mock("@/hooks/useAI", () => ({
  useOllamaStatus: () => ({ data: true }),
}));

vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => ({ data: { llmModel: "llama3:8b" } }),
}));

// Mock dispatch
const dispatchMock = vi.fn();
vi.mock("@/contexts/AppContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/contexts/AppContext")>();
  return {
    ...actual,
    useAppDispatch: () => dispatchMock,
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AppProvider>{children}</AppProvider>
    </QueryClientProvider>
  );
}

describe("AppSidebar", () => {
  it("renders navigation items", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByText("Trash")).toBeInTheDocument();
  });

  it("navigates to folders when clicked", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText("Favorites"));
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_ACTIVE_FOLDER",
      folder: "favorites",
    });

    fireEvent.click(screen.getByText("Recent"));
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_ACTIVE_FOLDER",
      folder: "recent",
    });

    fireEvent.click(screen.getByText("Trash"));
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_ACTIVE_FOLDER",
      folder: "trash",
    });
  });

  it("renders Ollama status section", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("Ollama AI")).toBeInTheDocument();
  });

  it("renders Ollama AI label with hover Settings text", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    // Text should be present (hidden or visible)
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("opens settings when model card is clicked", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByTestId("model-card"));
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_SETTINGS_OPEN",
      open: true,
    });
  });

  it("renders Ask AI hint with ⌘J shortcut", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("Ask AI")).toBeInTheDocument();
    expect(screen.getByText("⌘J")).toBeInTheDocument();
  });
});
