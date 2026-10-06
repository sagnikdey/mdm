import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextMorph } from "@sagui/ui";

const meta = {
  title: "Text/Text morph",
  component: TextMorph,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { children: "Publish" },
  decorators: [(Story) => <div className="w-[320px] max-w-full"><Story /></div>],
} satisfies Meta<typeof TextMorph>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Heading: Story = { args: { as: "h2", children: "Design", className: "text-4xl font-semibold tracking-tight" } };
