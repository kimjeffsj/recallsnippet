import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnippetForm } from "./SnippetForm";
import type { Tag, Snippet } from "@/lib/types";

const mockTags: Tag[] = [
  { id: "t1", name: "rust" },
  { id: "t2", name: "async" },
];

describe("SnippetForm", () => {
  it("renders create form", () => {
    render(
      <SnippetForm
        availableTags={mockTags}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("New Snippet")).toBeInTheDocument();
    expect(screen.getByLabelText("Title *")).toBeInTheDocument();
    expect(screen.getByLabelText("Problem *")).toBeInTheDocument();
  });

  it("renders edit form with existing data", () => {
    const snippet: Snippet = {
      id: "s1",
      title: "Existing Title",
      problem: "Existing Problem",
      solution: "Existing Solution",
      code: null,
      codeLanguage: null,
      referenceUrl: null,
      tags: [{ id: "t1", name: "rust" }],
      createdAt: "2026-02-07",
      updatedAt: "2026-02-07",
    };

    render(
      <SnippetForm
        snippet={snippet}
        availableTags={mockTags}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("Edit Snippet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Problem")).toBeInTheDocument();
  });

  it("submit button is disabled when required fields empty", () => {
    render(
      <SnippetForm
        availableTags={[]}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    const submitButton = screen.getByText("Create");
    expect(submitButton).toBeDisabled();
  });

  it("calls onSubmit with form data", () => {
    const handleSubmit = vi.fn();
    render(
      <SnippetForm
        availableTags={mockTags}
        onSubmit={handleSubmit}
        onCancel={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText("Problem *"), {
      target: { value: "Test Problem" },
    });
    fireEvent.click(screen.getByText("Create"));

    expect(handleSubmit).toHaveBeenCalledWith({
      title: "Test Title",
      problem: "Test Problem",
      solution: undefined,
      code: undefined,
      codeLanguage: undefined,
      referenceUrl: undefined,
      tagIds: [],
    });
  });

  it("calls onCancel when cancel clicked", () => {
    const handleCancel = vi.fn();
    render(
      <SnippetForm
        availableTags={[]}
        onSubmit={() => {}}
        onCancel={handleCancel}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(handleCancel).toHaveBeenCalled();
  });

  it("toggles tag selection", () => {
    const handleSubmit = vi.fn();
    render(
      <SnippetForm
        availableTags={mockTags}
        onSubmit={handleSubmit}
        onCancel={() => {}}
      />,
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "Title" },
    });
    fireEvent.change(screen.getByLabelText("Problem *"), {
      target: { value: "Problem" },
    });

    // Select a tag
    fireEvent.click(screen.getByText("rust"));

    // Submit
    fireEvent.click(screen.getByText("Create"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tagIds: ["t1"],
      }),
    );
  });

  it("shows loading state", () => {
    render(
      <SnippetForm
        availableTags={[]}
        onSubmit={() => {}}
        onCancel={() => {}}
        isLoading={true}
      />,
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
