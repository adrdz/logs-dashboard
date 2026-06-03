import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import NavBar from "./NavBar";

const meta = {
  title: "Layout/NavBar",
  component: NavBar,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/logs" } },
  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnLogs: Story = {};

export const OnDashboard: Story = {
  parameters: { nextjs: { navigation: { pathname: "/dashboard" } } },
};

// Functional: brand + all nav links render, and the current route is active.
export const RendersLinksAndActiveRoute: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Logs Dashboard")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "New Log" })).toBeInTheDocument();

    const logsLink = canvas.getByRole("link", { name: "Logs" });
    await expect(logsLink).toHaveClass("navbar__link--active");
  },
};
