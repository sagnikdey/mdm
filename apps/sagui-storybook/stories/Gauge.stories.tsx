import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gauge } from "@sagui/ui";

const meta = {
  title: "Charts/Gauge",
  component: Gauge,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Disk usage", value: 72, detail: "360 of 500 GB", thresholds: [{ from: 0, tone: "success", label: "Healthy" }, { from: 70, tone: "warning", label: "Filling up" }, { from: 90, tone: "danger", label: "Critical" }] },
  decorators: [(Story) => <div className="w-[240px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Gauge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Critical: Story = { args: { value: 94, detail: "470 of 500 GB" } };
export const NoThresholds: Story = { args: { thresholds: undefined, tone: "accent", label: "Build minutes", value: 1240, max: 2000, detail: "1,240 of 2,000" } };
