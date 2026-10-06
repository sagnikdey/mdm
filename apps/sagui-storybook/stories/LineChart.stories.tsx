import type { Meta, StoryObj } from "@storybook/react-vite";
import { LineChart } from "@sagui/ui";
import { signups, signupSeries } from "./sample-data";

const meta = {
  title: "Charts/Line chart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Signups", data: signups(30), series: signupSeries },
  decorators: [(Story) => <div className="w-[640px] max-w-full"><Story /></div>],
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NinetyDays: Story = { args: { data: signups(90) } };
export const Linear: Story = { args: { curve: "linear", series: [signupSeries[0]] } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
