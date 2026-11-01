import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";
import { Pagination } from "@sagui/ui";

import { figma } from "../.storybook/figma";

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: { design: figma("284:243"), layout: "padded" },
  args: { page: 5, pageCount: 25, onPageChange: fn(), summary: "Showing 41–50 of 248" },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Page 6" }));
    await expect(args.onPageChange).toHaveBeenCalledWith(6);
  },
};
export const FirstPage: Story = {
  args: { page: 1 },
  play: async ({ canvas }) => { await expect(canvas.getByRole("button", { name: "Previous" })).toBeDisabled(); },
};
export const Compact: Story = { args: { layout: "compact", page: 3 } };
export const Interactive: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};
