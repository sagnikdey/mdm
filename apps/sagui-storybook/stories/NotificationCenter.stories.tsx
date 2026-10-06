import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationCenter } from "@sagui/ui";

const meta = {
  title: "Messages/Notification center",
  component: NotificationCenter,
  tags: ["autodocs"],
  args: {
    notifications: [
      { id: "n1", title: "Maya Chen closed Acme", description: "$42,000, two weeks ahead of forecast.", time: "8m", tone: "success" },
      { id: "n2", title: "Globex is waiting on legal", description: "Contract review has been open for 6 days.", time: "1h", tone: "warning" },
      { id: "n3", title: "Q3 forecast is ready", time: "Yesterday", read: true },
    ],
  },
} satisfies Meta<typeof NotificationCenter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = { args: { open: true } };
