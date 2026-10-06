import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityHeatmap } from "@sagui/ui";
import { contributions } from "./sample-data";

const meta = {
  title: "Charts/Activity heatmap",
  component: ActivityHeatmap,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Contributions in 2026", period: "2026", days: contributions() },
  decorators: [(Story) => <div className="w-[760px] max-w-full"><Story /></div>],
} satisfies Meta<typeof ActivityHeatmap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const MondayFirst: Story = { args: { weekStartsOn: 1, unit: { one: "deploy", other: "deploys" } } };
