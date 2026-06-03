import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { TimeseriesResponse } from "@/lib/types";
import Trend from "./Trend";

const sample: TimeseriesResponse = {
  interval: "day",
  group_by: "severity",
  data: [
    { bucket: "2026-05-01T00:00:00Z", label: "INFO", count: 12 },
    { bucket: "2026-05-01T00:00:00Z", label: "ERROR", count: 3 },
    { bucket: "2026-05-02T00:00:00Z", label: "INFO", count: 18 },
    { bucket: "2026-05-02T00:00:00Z", label: "ERROR", count: 5 },
    { bucket: "2026-05-03T00:00:00Z", label: "INFO", count: 9 },
    { bucket: "2026-05-03T00:00:00Z", label: "ERROR", count: 7 },
  ],
};

const meta = {
  title: "Info/Chart/Trend",
  component: Trend,
  args: { data: sample, groupBy: "severity", onGroupByChange: fn() },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Trend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BySeverity: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { data: { interval: "day", group_by: "severity", data: [] } } };

// Functional: renders its title and the grouping toggle.
export const RendersTitle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/log trend over time/i)).toBeInTheDocument();
  },
};

// Functional: toggling to "By Source" notifies the parent.
export const TogglesGroupBy: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /by source/i }));
    await expect(args.onGroupByChange).toHaveBeenCalledWith("source");
  },
};

// Functional: empty data shows the friendly empty state.
export const ShowsEmptyState: Story = {
  args: { data: { interval: "day", group_by: "severity", data: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no data for the selected filters/i)).toBeInTheDocument();
  },
};
