import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, within } from "storybook/test";
import MobileMenu from "./MobileMenu";

const meta = {
  title: "Layout/MobileMenu",
  component: MobileMenu,
  args: { open: true, onClose: fn() },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof MobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = { args: { open: false } };

// Functional: the overlay lists the nav items plus the theme toggle. The
// overlay is mobile-only (hidden via CSS media query at the test's desktop
// width), so query with `hidden: true`.
export const RendersNavAndThemeToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Summary", hidden: true })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Logs List", hidden: true })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "About", hidden: true })).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /switch to (light|dark) theme/i, hidden: true })
    ).toBeInTheDocument();
  },
};

// Functional: clicking a nav link closes the overlay. (fireEvent, since the
// mobile overlay is CSS-hidden at the test's desktop width.)
export const ClosesOnLinkClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByRole("link", { name: "Logs List", hidden: true }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
