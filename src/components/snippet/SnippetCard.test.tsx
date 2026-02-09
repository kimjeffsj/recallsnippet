import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnippetCard } from "./SnippetCard";
import type { SnippetSummary } from "@/lib/types";

const mockSnippet: SnippetSummary = {
  id: "s1",
  title: "Fix async/await error",
  problem: "Getting unhandled promise rejection when using async/await",
  codeLanguage: "typescript",
  tags: [
    { id: "t1", name: "async" },
    { id: "t2", name: "error-handling" },
  ],
  createdAt: "2026-02-07",
};

describe("SnippetCard", () => {
  it("renders title and problem", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("Fix async/await error")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Getting unhandled promise rejection when using async/await",
      ),
    ).toBeInTheDocument();
  });

  it("renders language badge", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("renders tag badges", () => {
    render(
      <SnippetCard snippet={mockSnippet} onClick={() => {}} />,
    );

    expect(screen.getByText("async")).toBeInTheDocument();
    expect(screen.getByText("error-handling")).toBeInTheDocument();
  });

  it("calls onClick with snippet id", () => {
    const handleClick = vi.fn();
    render(
      <SnippetCard snippet={mockSnippet} onClick={handleClick} />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledWith("s1");
  });

  it("applies selected styles when isSelected", () => {
    render(
      <SnippetCard
        snippet={mockSnippet}
        onClick={() => {}}
        isSelected={true}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.className).toContain("border-primary");
  });

  it("renders without language when codeLanguage is null", () => {
    const snippetNoLang: SnippetSummary = {
      ...mockSnippet,
      codeLanguage: null,
    };
    render(
      <SnippetCard snippet={snippetNoLang} onClick={() => {}} />,
    );

    expect(screen.queryByText("typescript")).not.toBeInTheDocument();
    expect(screen.getByText("Fix async/await error")).toBeInTheDocument();
  });
});
