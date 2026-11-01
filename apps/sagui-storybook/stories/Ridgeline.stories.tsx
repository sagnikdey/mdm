import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ridgeline } from "@sagui/ui";
import { latency } from "./sample-data";

const meta = {
  title: "Charts/Ridgeline",
  component: Ridgeline,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "API latency by region", unit: " ms", series: latency() },
  decorators: [(Story) => <div className="w-[640px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Ridgeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Untinted: Story = { args: { tint: false } };
export const Empty: Story = { args: { series: [] } };
