import type { Meta, StoryObj } from "@storybook/react-vite";
import { TriangleAlert, UserPlus } from "lucide-react";
import { Timeline } from "@sagui/ui";
import { activity, timelineNow } from "./sample-data";

const icons: Record<string, React.ReactNode> = { e2: <TriangleAlert size={14} />, e6: <UserPlus size={14} /> };
const events = activity.map((event) => ({ ...event, icon: icons[event.id] }));

const meta = {
  title: "Data/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Project activity", events, now: timelineNow },
  decorators: [(Story) => <div className="w-[520px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Scrolling: Story = { args: { maxHeight: 280 } };
export const Expanded: Story = { args: { defaultExpanded: ["e2"] } };
