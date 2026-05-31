import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SeverityChip from "@/components/SeverityChip";

describe("SeverityChip", () => {
  it.each(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] as const)(
    "renders %s with correct label",
    (severity) => {
      render(<SeverityChip severity={severity} />);
      expect(screen.getByText(severity)).toBeInTheDocument();
    }
  );
});
