import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { SpotlightChat } from "./SpotlightChat";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve("AI response")),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("SpotlightChat", () => {
  it("renders when open", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Recall Assistant")).toBeInTheDocument();
    expect(screen.getByText("Ask about your snippets")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search your knowledge base...")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <SpotlightChat open={false} onOpenChange={() => {}} />,
      { wrapper: createWrapper() },
    );

    expect(screen.queryByText("Recall Assistant")).not.toBeInTheDocument();
  });

  it("shows snippet context when provided", () => {
    render(
      <SpotlightChat
        open={true}
        onOpenChange={() => {}}
        snippetContext={{ title: "Docker fix", problem: "Container issue" }}
      />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Context: Docker fix")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask about this snippet...")).toBeInTheDocument();
  });

  it("adds user message to chat on send", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} />,
      { wrapper: createWrapper() },
    );

    const input = screen.getByPlaceholderText("Search your knowledge base...");
    fireEvent.change(input, { target: { value: "How did I fix Docker?" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("How did I fix Docker?")).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("shows ⌘J shortcut hint", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("⌘J")).toBeInTheDocument();
  });
});
