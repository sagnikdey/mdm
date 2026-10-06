import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilePlus2, Handshake, LayoutDashboard, Settings } from "lucide-react";
import { CommandPalette } from "@sagui/ui";

const meta = {
  title: "Navigation/Command palette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    items: [
      { id: "overview", label: "Overview", group: "Pages", icon: <LayoutDashboard /> },
      { id: "deals", label: "Deals", group: "Pages", icon: <Handshake />, keywords: ["opportunities"] },
      { id: "new-deal", label: "Create deal", description: "Start from a blank deal", group: "Actions", icon: <FilePlus2 />, shortcut: "N" },
      { id: "settings", label: "Settings", group: "Actions", icon: <Settings />, shortcut: "⌘," },
    ],
  },
  decorators: [(Story) => <div className="w-[520px] max-w-full"><Story /></div>],
} satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Closable: Story = { args: { onClose: () => {} } };
