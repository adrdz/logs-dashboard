import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import ThemeToggle from "./ThemeToggle";

const meta = {
  title: "Layout/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Functional: clicking flips the accessible label between light and dark.
// (The providers decorator supplies a working ThemeMode context.)
export const TogglesLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /switch to dark theme/i });
    await expect(button).toBeInTheDocument();

    await userEvent.click(button);

    await expect(
      canvas.getByRole("button", { name: /switch to light theme/i })
    ).toBeInTheDocument();
  },
};
