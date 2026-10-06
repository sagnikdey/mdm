import type { Meta, StoryObj } from "@storybook/react-vite";
import { SlopeChart } from "@sagui/ui";
import { channelsQ2, channelsQ3 } from "./sample-data";

const meta = {
  title: "Charts/Slope chart",
  component: SlopeChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Conversion by channel", startLabel: "Q1", endLabel: "Q2", data: channelsQ2, highlightKey: "email", formatValue: (value: number) => `${value.toFixed(1)}%` },
  decorators: [(Story) => <div className="w-[480px] max-w-full"><Story /></div>],
} satisfies Meta<typeof SlopeChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NextQuarter: Story = { args: { data: channelsQ3, startLabel: "Q2", endLabel: "Q3" } };
export const NoRanks: Story = { args: { ranks: false } };
