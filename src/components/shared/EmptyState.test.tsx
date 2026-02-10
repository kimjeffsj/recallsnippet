import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "./EmptyState";
import { FileCode } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No snippets"
        description="Create your first snippet"
      />,
    );
    expect(screen.getByText("No snippets")).toBeInTheDocument();
    expect(screen.getByText("Create your first snippet")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        actionLabel="Add New"
        onAction={handleAction}
      />,
    );
    fireEvent.click(screen.getByText("Add New"));
    expect(handleAction).toHaveBeenCalled();
  });

  it("does not render action button when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="Empty"
        icon={<FileCode data-testid="icon" />}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
