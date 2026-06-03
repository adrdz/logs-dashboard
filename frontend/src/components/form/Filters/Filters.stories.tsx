import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SOURCES } from "@/lib/constants";
import Filters from "./Filters";

const meta = {
  title: "Form/Filters",
  component: Filters,
  args: { values: {}, onChange: fn() },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Filters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearchAndSources: Story = {
  args: { showSearch: true, sources: SOURCES },
};

// Functional: search field only appears when showSearch is set.
export const SearchShownWhenEnabled: Story = {
  args: { showSearch: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/search messages/i)).toBeInTheDocument();
  },
};

export const SearchHiddenByDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByLabelText(/search messages/i)).not.toBeInTheDocument();
  },
};

// Functional: Reset clears all filters via onChange({}).
export const ResetClearsFilters: Story = {
  args: { values: { search: "foo", source: "auth-service" } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /reset/i }));
    await expect(args.onChange).toHaveBeenCalledWith({});
  },
};

// Functional: a source select is rendered only when sources are supplied.
export const SourceSelectWhenProvided: Story = {
  args: { sources: SOURCES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/source/i)).toBeInTheDocument();
  },
};
