import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, within } from "storybook/test";
import Header from "./Header";

const meta = {
  title: "Layout/Header",
  component: Header,
  args: { menuOpen: false, onMenuToggle: fn() },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MenuOpen: Story = { args: { menuOpen: true } };

// Functional: the brand is a link back to the home/Summary route.
export const BrandLinksToHome: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const brand = canvas.getByRole("link", { name: /logs dashboard/i });
    await expect(brand).toHaveAttribute("href", "/");
  },
};

// Functional: the hamburger button toggles the menu. It's only visible at
// mobile widths (CSS media query) and lives in a display:none subtree at the
// test's desktop width, so select it directly and use fireEvent.
export const HamburgerTogglesMenu: Story = {
  play: async ({ canvasElement, args }) => {
    const burger = canvasElement.querySelector<HTMLButtonElement>(".header__burger");
    await expect(burger).not.toBeNull();
    await fireEvent.click(burger!);
    await expect(args.onMenuToggle).toHaveBeenCalled();
  },
};
