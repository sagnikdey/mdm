import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrushChart } from "@sagui/ui";
import { dailyActiveUsers, launches } from "./sample-data";

const days = dailyActiveUsers();

const meta = {
  title: "Charts/Brush chart",
  component: BrushChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Daily active users", unit: "users", data: days, annotations: launches },
  decorators: [(Story) => <div className="w-[720px] max-w-full"><Story /></div>],
} satisfies Meta<typeof BrushChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LastNinetyDays: Story = { args: { defaultRange: [days[days.length - 90].date as number, days[days.length - 1].date as number] } };
