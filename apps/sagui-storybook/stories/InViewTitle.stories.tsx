import type { Meta, StoryObj } from "@storybook/react-vite";
import { InViewTitle } from "@sagui/ui";

const meta = {
  title: "Text/In-view title",
  component: InViewTitle,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { text: "Make every word count", className: "text-4xl font-semibold tracking-tight" }, argTypes: { variant: { control: "inline-radio", options: ["blur", "word", "line", "tracking", "wipe"] } },
  decorators: [(Story) => <div className="w-[640px] max-w-full"><Story /></div>],
} satisfies Meta<typeof InViewTitle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Blur: Story = {};
export const Word: Story = { args: { variant: "word" } };
export const Line: Story = { args: { variant: "line", text: "Everything your team needs to ship", lines: ["Everything your team", "needs to ship"] } };
export const Tracking: Story = { args: { variant: "tracking" } };
export const Wipe: Story = { args: { variant: "wipe" } };
