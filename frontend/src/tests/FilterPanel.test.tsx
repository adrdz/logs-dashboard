import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterPanel from "@/components/FilterPanel";

// MUI date pickers need this
vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@mui/x-date-pickers/DateTimePicker", () => ({
  DateTimePicker: ({ label }: { label: string }) => <input aria-label={label} />,
}));

describe("FilterPanel", () => {
  it("renders search input when showSearch=true", () => {
    render(
      <FilterPanel values={{}} onChange={() => {}} showSearch />
    );
    expect(screen.getByLabelText(/search messages/i)).toBeInTheDocument();
  });

  it("does not render search input when showSearch=false", () => {
    render(<FilterPanel values={{}} onChange={() => {}} />);
    expect(screen.queryByLabelText(/search messages/i)).not.toBeInTheDocument();
  });

  it("calls onChange with empty object when Reset is clicked", () => {
    const onChange = vi.fn();
    render(<FilterPanel values={{ search: "foo" }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("renders source select when sources provided", () => {
    render(
      <FilterPanel
        values={{}}
        onChange={() => {}}
        sources={["auth-service", "payments-api"]}
      />
    );
    expect(screen.getByLabelText(/source/i)).toBeInTheDocument();
  });
});
