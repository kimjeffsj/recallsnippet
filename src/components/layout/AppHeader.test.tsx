import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppProvider } from "@/contexts/AppContext";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve(undefined)),
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

describe("AppHeader", () => {
  it("renders logo text", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    expect(screen.getByText("RecallSnippet")).toBeInTheDocument();
  });

  it("renders search input with placeholder", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText("Search snippets...")).toBeInTheDocument();
  });

  it("renders ⌘K shortcut hint", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("renders New Snippet button", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    expect(screen.getByText("New Snippet")).toBeInTheDocument();
  });

  it("updates search query on input", () => {
    render(<AppHeader />, { wrapper: createWrapper() });
    const input = screen.getByPlaceholderText("Search snippets...");
    fireEvent.change(input, { target: { value: "docker" } });
    expect(input).toHaveValue("docker");
  });
});
