import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import type { AnalyticsSummary } from "@/lib/types";
import SectionSummary from "./SectionSummary";

const sample: AnalyticsSummary = {
  total: 1234,
  by_severity: [
    { severity: "INFO", count: 800 },
    { severity: "ERROR", count: 434 },
  ],
  by_source: [{ source: "auth-service", count: 600 }],
};

const meta = {
  title: "Summary/SectionSummary",
  component: SectionSummary,
  args: { summary: sample },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SectionSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { summary: undefined, isLoading: true } };
export const NoData: Story = { args: { summary: undefined } };

// Functional: total + per-severity counts render with locale formatting.
export const RendersCounts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1,234")).toBeInTheDocument();
    await expect(canvas.getByText("INFO")).toBeInTheDocument();
    await expect(canvas.getByText("800")).toBeInTheDocument();
    await expect(canvas.getByText("ERROR")).toBeInTheDocument();
    await expect(canvas.getByText("434")).toBeInTheDocument();
  },
};

// Functional: loading shows skeleton placeholders.
export const RendersSkeletons: Story = {
  args: { summary: undefined, isLoading: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll(".summary__skeleton").length).toBeGreaterThan(0);
  },
};

// Functional: nothing renders without a summary and not loading.
export const RendersNothingWhenEmpty: Story = {
  args: { summary: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".summary")).toBeNull();
  },
};
