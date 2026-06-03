import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { SEVERITIES } from "@/lib/constants";
import Severity from "./Severity";

const meta = {
  title: "Info/Chip/Severity",
  component: Severity,
  tags: ["autodocs"],
  args: { severity: "INFO" },
  argTypes: {
    severity: { control: "select", options: SEVERITIES },
    size: { control: "radio", options: ["small", "medium"] },
  },
} satisfies Meta<typeof Severity>;

export default meta;
type Story = StoryObj<typeof meta>;

// One swatch per severity — a quick visual reference of the colour ramp.
export const Debug: Story = { args: { severity: "DEBUG" } };
export const Info: Story = { args: { severity: "INFO" } };
export const Warning: Story = { args: { severity: "WARNING" } };
export const Error: Story = { args: { severity: "ERROR" } };
export const Critical: Story = { args: { severity: "CRITICAL" } };
export const Medium: Story = { args: { severity: "WARNING", size: "medium" } };

// Functional: label text + BEM modifier + default size.
export const RendersLabelAndModifier: Story = {
  args: { severity: "ERROR" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ERROR")).toBeInTheDocument();
    await expect(canvasElement.querySelector(".chip--error")).not.toBeNull();
    await expect(canvasElement.querySelector(".chip--small")).not.toBeNull();
  },
};

// Functional: medium size modifier is applied.
export const MediumSize: Story = {
  args: { severity: "INFO", size: "medium" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".chip--medium")).not.toBeNull();
  },
};
