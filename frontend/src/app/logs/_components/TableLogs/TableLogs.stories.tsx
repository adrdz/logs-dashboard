import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Log } from "@/lib/types";
import TableLogs from "./TableLogs";

const rows: Log[] = [
  {
    id: 1,
    timestamp: "2026-05-01T10:00:00Z",
    message: "User signed in",
    severity: "INFO",
    source: "auth-service",
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: 2,
    timestamp: "2026-05-01T10:05:00Z",
    message: "Payment failed",
    severity: "ERROR",
    source: "payments-api",
    created_at: "2026-05-01T10:05:00Z",
  },
];

const meta = {
  title: "Logs/TableLogs",
  component: TableLogs,
  args: {
    rows,
    rowCount: rows.length,
    isLoading: false,
    paginationModel: { page: 0, pageSize: 25 },
    onPaginationModelChange: fn(),
    sortModel: [{ field: "timestamp", sort: "desc" }],
    onSortModelChange: fn(),
    onRowClick: fn(),
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof TableLogs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { rows: [], rowCount: 0, isLoading: true } };

// Functional: rows render with their message and a severity chip.
export const RendersRows: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("User signed in")).toBeInTheDocument();
    await expect(canvas.getByText("Payment failed")).toBeInTheDocument();
    // ChipSeverity renders the severity label inside the grid.
    await expect(canvas.getByText("ERROR")).toBeInTheDocument();
  },
};

// Functional: clicking a row reports its id to the parent.
export const RowClickFiresCallback: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Payment failed"));
    await expect(args.onRowClick).toHaveBeenCalledWith(2);
  },
};
