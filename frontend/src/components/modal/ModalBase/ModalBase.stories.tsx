import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import Button from "@mui/material/Button";
import ModalBase from "./ModalBase";

const meta = {
  title: "Modal/ModalBase",
  component: ModalBase,
  args: {
    open: true,
    onClose: fn(),
    title: "Example Modal",
    children: "Modal body content.",
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ModalBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: { actions: <Button variant="contained">Confirm</Button> },
};

// Functional: the close (X) button triggers onClose. The Dialog renders into a
// portal on document.body, so we query there rather than the canvas.
export const CloseButtonCallsOnClose: Story = {
  play: async ({ args }) => {
    const body = within(document.body);
    await userEvent.click(body.getByRole("button", { name: /close/i }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
