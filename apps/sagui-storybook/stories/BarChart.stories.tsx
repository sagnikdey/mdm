import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "@sagui/ui";
import { activeMinutes } from "./sample-data";

const meta = {
  title: "Charts/Bar chart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Active minutes", period: "Sep 15–21, 2026", unit: "min", data: activeMinutes(7) },
  decorators: [(Story) => <div className="w-[420px] max-w-full"><Story /></div>],
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoWeeks: Story = { args: { data: activeMinutes(14), period: "Sep 8–21, 2026" } };
export const NoAverage: Story = { args: { showAverage: false } };
