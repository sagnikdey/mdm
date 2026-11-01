import type { Meta, StoryObj } from "@storybook/react-vite";
import { Treemap } from "@sagui/ui";
import { revenueByRegion } from "./sample-data";

const meta = {
  title: "Charts/Treemap",
  component: Treemap,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Annual recurring revenue", data: revenueByRegion, colorLabel: "Growth", formatColor: (value: number) => `+${value}%`, formatValue: (value: number) => `$${(value / 1000).toFixed(1)}M` },
  decorators: [(Story) => <div className="w-[720px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Treemap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Europe: Story = { args: { defaultFocus: "eu" } };
export const OneHue: Story = { args: { colorLabel: undefined } };
