import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonutChart } from "@sagui/ui";
import { trafficLastMonth, trafficThisMonth } from "./sample-data";

const meta = {
  title: "Charts/Donut chart",
  component: DonutChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Visits by source", unit: "visits", data: trafficThisMonth },
  decorators: [(Story) => <div className="w-[560px] max-w-full"><Story /></div>],
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LastMonth: Story = { args: { data: trafficLastMonth } };
export const SelectFromLegend: Story = { args: { legendAction: "select", defaultActiveKey: "search" } };
export const Empty: Story = { args: { data: [] } };
