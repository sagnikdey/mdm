import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextReveal } from "@sagui/ui";

const meta = {
  title: "Text/Text reveal",
  component: TextReveal,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { as: "h2", text: "Ship interfaces\nthat feel precise", className: "text-4xl font-semibold tracking-tight" },
  decorators: [(Story) => <div className="w-[560px] max-w-full"><Story /></div>],
} satisfies Meta<typeof TextReveal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Paragraph: Story = { args: { as: "p", className: "text-lg text-muted-foreground", text: "Each word rises out of its own clip while it sharpens from a soft blur." } };
