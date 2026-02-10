import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppProvider } from "@/contexts/AppContext";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn((cmd: string) => {
    if (cmd === "list_snippets") return Promise.resolve([]);
    if (cmd === "check_ollama_connection") return Promise.resolve(false);
    return Promise.resolve(undefined);
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
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

  it("marks Favorites, Recent, Trash as disabled", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("Favorites").closest("button")).toBeDisabled();
    expect(screen.getByText("Recent").closest("button")).toBeDisabled();
    expect(screen.getByText("Trash").closest("button")).toBeDisabled();
  });

  it("renders Ollama status section", () => {
    render(<AppSidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("Ollama AI")).toBeInTheDocument();
  });
});
