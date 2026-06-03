import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, userEvent, within } from "storybook/test";
import { SOURCES } from "@/lib/constants";
import Logs from "./Logs";

const meta = {
  title: "Form/Logs",
  component: Logs,
  // `onSubmit` is reset between stories by the test addon.
  args: { onSubmit: fn() },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Logs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Editing: Story = {
  args: {
    initial: {
      message: "Connection pool exhausted",
      severity: "ERROR",
      source: "payments-api",
    },
    submitLabel: "Save Changes",
  },
};

// Functional: an empty form cannot be submitted. The message field is natively
// `required`, so the browser blocks submission before onSubmit ever runs.
export const RequiresMessage: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /save/i }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(canvas.getByLabelText(/message/i)).toBeInvalid();
  },
};

// Functional: a message without a source still blocks submission.
export const RequiresSource: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/message/i), "Something happened");
    await userEvent.click(canvas.getByRole("button", { name: /save/i }));
    await expect(canvas.getByText(/source is required/i)).toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

// Functional: a fully valid form calls onSubmit with the trimmed payload.
export const SubmitsWhenValid: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/message/i), "Order processed");

    // MUI Select opens a portalled listbox — query options from the document.
    await userEvent.click(canvas.getByLabelText(/source/i));
    await userEvent.click(await screen.findByRole("option", { name: SOURCES[0] }));

    await userEvent.click(canvas.getByRole("button", { name: /save/i }));

    await expect(args.onSubmit).toHaveBeenCalledOnce();
    await expect(args.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Order processed",
        severity: "INFO",
        source: SOURCES[0],
      })
    );
  },
};
