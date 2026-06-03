import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, userEvent, within } from "storybook/test";
import type { TimeseriesResponse } from "@/lib/types";
import SectionTrend from "./SectionTrend";

const sample: TimeseriesResponse = {
  interval: "day",
  group_by: "severity",
  data: [
    { bucket: "2026-05-01T00:00:00Z", label: "INFO", count: 12 },
    { bucket: "2026-05-02T00:00:00Z", label: "INFO", count: 18 },
    { bucket: "2026-05-03T00:00:00Z", label: "INFO", count: 9 },
  ],
};

const meta = {
  title: "Dashboard/SectionTrend",
  component: SectionTrend,
  args: {
    data: sample,
    isLoading: false,
    interval: "day",
    groupBy: "severity",
    onIntervalChange: fn(),
    onGroupByChange: fn(),
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SectionTrend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Functional: choosing a different interval notifies the parent.
export const ChangesInterval: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText(/interval/i));
    await userEvent.click(await screen.findByRole("option", { name: "Week" }));
    await expect(args.onIntervalChange).toHaveBeenCalledWith("week");
  },
};
