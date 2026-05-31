import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SummaryCards from "@/components/SummaryCards";
import type { AnalyticsSummary } from "@/lib/types";

const mockSummary: AnalyticsSummary = {
  total: 1234,
  by_severity: [
    { severity: "INFO", count: 800 },
    { severity: "ERROR", count: 434 },
  ],
  by_source: [
    { source: "auth-service", count: 600 },
  ],
};

describe("SummaryCards", () => {
  it("renders total count", () => {
    render(<SummaryCards summary={mockSummary} />);
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("renders severity counts", () => {
    render(<SummaryCards summary={mockSummary} />);
    expect(screen.getByText("INFO")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("434")).toBeInTheDocument();
  });

  it("renders skeletons when loading", () => {
    const { container } = render(<SummaryCards isLoading />);
    // Skeletons should be present
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
  });
});
