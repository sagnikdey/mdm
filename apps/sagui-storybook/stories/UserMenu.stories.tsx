import type { Meta, StoryObj } from "@storybook/react-vite";
import { CreditCard, Settings, UserRound } from "lucide-react";
import { UserMenu } from "@sagui/ui";

const meta = {
  title: "Navigation/User menu",
  component: UserMenu,
  tags: ["autodocs"],
  args: {
    user: { name: "Maya Chen", email: "maya@example.com", plan: "Pro" },
    items: [{ label: "Profile", icon: <UserRound /> }, { label: "Billing", icon: <CreditCard /> }, { label: "Settings", icon: <Settings />, keys: ["⌘", ","] }],
    onSignOut: () => new Promise<void>((resolve) => setTimeout(resolve, 900)),
  },
} satisfies Meta<typeof UserMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithName: Story = { args: { showName: true } };
export const WithStatus: Story = { args: { defaultStatus: "busy", onStatusChange: () => {} } };
export const Open: Story = { args: { defaultOpen: true, portal: false } };
