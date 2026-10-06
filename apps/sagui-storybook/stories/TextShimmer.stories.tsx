import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextShimmer } from "@sagui/ui";

const meta = {
  title: "Text/Text shimmer",
  component: TextShimmer,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { children: "Generating summary" },
  decorators: [(Story) => <div className="w-[420px] max-w-full"><Story /></div>],
} satisfies Meta<typeof TextShimmer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Inactive: Story = { args: { active: false, children: "Summary ready" } };
export const Slow: Story = { args: { duration: 3, as: "h3", className: "text-2xl font-semibold tracking-tight", children: "Thinking about your question" } };
