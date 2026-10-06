import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChipGroup } from "@sagui/ui";

const topics = ["Design", "Motion", "Tokens", "Accessibility", "React", "Storybook", "Typography", "Layout", "Color", "Forms"].map((label) => ({ value: label.toLowerCase(), label }));

const meta = {
  title: "Selection/Chip group",
  component: ChipGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Topics", options: topics.slice(0, 5), defaultValue: ["design"] },
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
} satisfies Meta<typeof ChipGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Multiple: Story = {};
export const Single: Story = { args: { multiple: false } };
export const Folded: Story = { args: { options: topics, maxVisible: 4 } };
