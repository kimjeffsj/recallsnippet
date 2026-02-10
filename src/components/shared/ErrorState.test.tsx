import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders default error message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("renders custom error message", () => {
    render(<ErrorState message="Network timeout" />);
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });

  it("renders retry button when onRetry provided", () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    fireEvent.click(screen.getByText("Try Again"));
    expect(handleRetry).toHaveBeenCalled();
  });

  it("does not render retry button when onRetry not provided", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });
});
