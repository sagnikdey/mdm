import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkline } from "@sagui/ui";

const meta = {
  title: "Charts/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Signups", data: [12, 18, 15, 22, 30, 27, 34], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], value: "34", change: "+26%", tone: "success" },
  decorators: [(Story) => <div className="w-[260px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Danger: Story = { args: { label: "Churn", data: [2.1, 2.3, 2.6, 2.9, 3.4], value: "3.4%", change: "+1.3 pts", tone: "danger", labels: undefined } };
export const NoArea: Story = { args: { area: false } };
export const Static: Story = { args: { interactive: false } };
