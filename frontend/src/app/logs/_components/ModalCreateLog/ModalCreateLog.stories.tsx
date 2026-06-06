import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import ModalCreateLog from "./ModalCreateLog";

const meta = {
  title: "Logs/ModalCreateLog",
  component: ModalCreateLog,
  args: { open: true, onClose: fn() },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ModalCreateLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = { args: { open: false } };

// Functional: the modal hosts the create-log form. (No submit here — that would
// hit the network; submission is covered by e2e.) Dialog renders in a portal.
export const RendersCreateForm: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(
      body.getByRole("heading", { name: /create log entry/i })
    ).toBeInTheDocument();
    await expect(body.getByLabelText(/message/i)).toBeInTheDocument();
    await expect(body.getByRole("button", { name: /create log/i })).toBeInTheDocument();
  },
};
