import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rocket, Sprout, Building2 } from "lucide-react";
import { RadioCards } from "@sagui/ui";

const meta = {
  title: "Selection/Radio cards",
  component: RadioCards,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    "aria-label": "Plan",
    defaultValue: "pro",
    options: [
      { value: "free", label: "Starter", description: "For trying things out.", meta: "$0", icon: <Sprout /> },
      { value: "pro", label: "Pro", description: "For teams that ship weekly.", meta: "$12", icon: <Rocket /> },
      { value: "enterprise", label: "Enterprise", description: "Custom limits and support.", meta: "Talk to us", icon: <Building2 />, disabled: true, disabledReason: "Contact sales to enable." },
    ],
  },
  decorators: [(Story) => <div className="w-[640px]"><Story /></div>],
} satisfies Meta<typeof RadioCards>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {};
export const List: Story = { args: { layout: "list" } };
