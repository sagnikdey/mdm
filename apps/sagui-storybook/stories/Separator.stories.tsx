import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@sagui/ui";

import { figma } from "../.storybook/figma";

const meta = {
  title: "Data Display/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: { design: figma("356:5"), layout: "padded" },
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = { decorators: [(Story) => <div className="w-64"><Story /></div>] };
export const Vertical: Story = {
  args: { orientation: "vertical" },
  decorators: [(Story) => <div className="flex h-8 items-center gap-3 text-sm text-fg-default">Billing<Story />Security</div>],
};
