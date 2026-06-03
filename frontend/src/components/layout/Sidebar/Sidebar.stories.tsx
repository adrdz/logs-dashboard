import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import Sidebar from "./Sidebar";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSummary: Story = {};

export const OnLogs: Story = {
  parameters: { nextjs: { navigation: { pathname: "/logs" } } },
};

// Functional: all nav items render, and the current route is marked active.
export const RendersNavWithActiveRoute: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Summary" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Logs List" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "About" })).toBeInTheDocument();

    await expect(canvas.getByRole("link", { name: "Summary" })).toHaveClass(
      "sidebar__link--active"
    );
  },
};

// "/" must not bleed active state onto other routes.
export const SummaryNotActiveOnLogs: Story = {
  parameters: { nextjs: { navigation: { pathname: "/logs" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Summary" })).not.toHaveClass(
      "sidebar__link--active"
    );
    await expect(canvas.getByRole("link", { name: "Logs List" })).toHaveClass(
      "sidebar__link--active"
    );
  },
};
