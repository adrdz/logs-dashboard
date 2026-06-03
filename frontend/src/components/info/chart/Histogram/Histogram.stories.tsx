import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import type { HistogramResponse } from "@/lib/types";
import Histogram from "./Histogram";

const sample: HistogramResponse = {
  data: [
    { severity: "DEBUG", count: 5 },
    { severity: "INFO", count: 40 },
    { severity: "WARNING", count: 12 },
    { severity: "ERROR", count: 8 },
    { severity: "CRITICAL", count: 2 },
  ],
};

const allZero: HistogramResponse = {
  data: sample.data.map((b) => ({ ...b, count: 0 })),
};

const meta = {
  title: "Info/Chart/Histogram",
  component: Histogram,
  args: { data: sample },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Histogram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Distribution: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { data: allZero } };

// Functional: renders its title.
export const RendersTitle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/severity distribution/i)).toBeInTheDocument();
  },
};

// Functional: an all-zero dataset shows the empty state instead of bars.
export const ShowsEmptyState: Story = {
  args: { data: allZero },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no data for the selected filters/i)).toBeInTheDocument();
  },
};
