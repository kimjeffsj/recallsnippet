import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SpotlightChat } from "./SpotlightChat";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve([])),
}));

describe("SpotlightChat", () => {
  it("renders when open", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.getByText("Find Related")).toBeInTheDocument();
    expect(screen.getByText("Search your snippets")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search your knowledge base...")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <SpotlightChat open={false} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.queryByText("Find Related")).not.toBeInTheDocument();
  });

  it("shows initial query when provided", () => {
    render(
      <SpotlightChat
        open={true}
        onOpenChange={() => {}}
        onSelectSnippet={() => {}}
        initialQuery="Docker fix"
      />,
    );

    const input = screen.getByPlaceholderText("Search your knowledge base...");
    expect(input).toHaveValue("Docker fix");
  });

  it("updates input on change", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    const input = screen.getByPlaceholderText("Search your knowledge base...");
    fireEvent.change(input, { target: { value: "How did I fix Docker?" } });

    expect(input).toHaveValue("How did I fix Docker?");
  });

  it("shows ⌘J shortcut hint", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.getByText("⌘J")).toBeInTheDocument();
  });

  it("shows empty state message before search", () => {
    render(
      <SpotlightChat open={true} onOpenChange={() => {}} onSelectSnippet={() => {}} />,
    );

    expect(screen.getByText("Find related snippets using semantic search")).toBeInTheDocument();
  });
});
