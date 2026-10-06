import type { Meta, StoryObj } from "@storybook/react-vite";
import { Streamgraph } from "@sagui/ui";
import { ticketTopics, tickets } from "./sample-data";

const meta = {
  title: "Charts/Streamgraph",
  component: Streamgraph,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Support tickets by topic", unit: "tickets", categoryLabel: "Week", data: tickets(26), series: ticketTopics },
  decorators: [(Story) => <div className="w-[680px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Streamgraph>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Silhouette: Story = { args: { offset: "silhouette" } };
export const ZeroBaseline: Story = { args: { offset: "zero" } };
