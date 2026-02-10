import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpotlightChat } from "./SpotlightChat";

const mockInvoke = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock("remark-gfm", () => ({
  default: () => {},
}));

describe("SpotlightChat", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it("renders when open", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.getAllByText("Recall Assistant").length).toBeGreaterThan(0);
    expect(screen.getByText("Ask your knowledge base")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask about your snippets...")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <SpotlightChat open={false} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.queryByText("Recall Assistant")).not.toBeInTheDocument();
  });

  it("shows ⌘J shortcut hint", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.getByText("⌘J")).toBeInTheDocument();
  });

  it("shows empty state message before chat", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.getByText("Ask questions and get answers from your saved snippets")).toBeInTheDocument();
  });

  it("shows snippet context when provided", () => {
    render(
      <SpotlightChat
        open={true}
        onOpenChange={() => {}}
        onSelectSnippet={() => {}}
        snippetContext={{ title: "Docker fix", problem: "Container crash" }}
      />,
    );

    expect(screen.getByText("Docker fix")).toBeInTheDocument();
  });

  it("displays user message after Enter", async () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    mockInvoke.mockResolvedValue({ answer: "Here is the answer", sources: [] });

    const textarea = screen.getByPlaceholderText("Ask about your snippets...");
    fireEvent.change(textarea, { target: { value: "How do I fix Docker?" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(screen.getByText("How do I fix Docker?")).toBeInTheDocument();
  });

  it("renders AI response with sources after sending message", async () => {
    mockInvoke.mockResolvedValue({
      answer: "Use docker restart",
      sources: [{ id: "s1", title: "Docker Restart", score: 0.85 }],
    });

    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    const textarea = screen.getByPlaceholderText("Ask about your snippets...");
    fireEvent.change(textarea, { target: { value: "Docker help" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Use docker restart")).toBeInTheDocument();
    });
    expect(screen.getByText("Docker Restart")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("calls onSelectSnippet when source card clicked", async () => {
    mockInvoke.mockResolvedValue({
      answer: "Answer",
      sources: [{ id: "s1", title: "My Snippet", score: 0.9 }],
    });

    const onSelect = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <SpotlightChat
        open={true}
        onOpenChange={onOpenChange}
        onSelectSnippet={onSelect}
      />,
    );

    const textarea = screen.getByPlaceholderText("Ask about your snippets...");
    fireEvent.change(textarea, { target: { value: "test" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("My Snippet")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("My Snippet"));
    expect(onSelect).toHaveBeenCalledWith("s1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows error message on failure", async () => {
    mockInvoke.mockRejectedValue("Ollama not running");

    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    const textarea = screen.getByPlaceholderText("Ask about your snippets...");
    fireEvent.change(textarea, { target: { value: "test" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Error: Ollama not running")).toBeInTheDocument();
    });
  });
});
