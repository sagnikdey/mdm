import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, MetricCard } from "@sagui/ui";

const meta = {
  title: "Cards/Metric card",
  component: MetricCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Active users", value: 12840, context: "Compared with last week", change: "+12.4%" },
  decorators: [(Story) => <div className="w-[300px]"><Story /></div>],
} satisfies Meta<typeof MetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Up: Story = {};
export const Down: Story = { args: { label: "Churn", value: 3.2, suffix: "%", decimals: 1, change: "-0.8%", context: "Lower is better" } };
export const Money: Story = { args: { label: "Revenue", value: 48250, prefix: "$", change: undefined, context: "Last 30 days" } };
export const Live: Story = {
  render: function Render(args) {
    const [step, setStep] = useState(0);
    const data = [{ value: 12840, change: "+12.4%" }, { value: 9120, change: "-8.1%" }, { value: 15300, change: "+19.2%" }];
    const current = data[step % data.length];
    return (
      <div className="grid gap-3">
        <MetricCard {...args} value={current.value} change={current.change} />
        <Button variant="outline" size="sm" onClick={() => setStep((s) => s + 1)}>Next period</Button>
      </div>
    );
  },
};
