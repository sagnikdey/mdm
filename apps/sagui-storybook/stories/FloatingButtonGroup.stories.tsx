import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Hand, MousePointer2, Redo2, Share2, Undo2 } from "lucide-react";
import { FloatingButtonGroup } from "@sagui/ui";

const meta = {
  title: "Components/Floating button group",
  component: FloatingButtonGroup,
  tags: ["autodocs"],
  args: {
    label: "Board actions",
    items: [
      { id: "undo", label: "Undo", icon: <Undo2 />, shortcut: "⌘Z" },
      { id: "redo", label: "Redo", icon: <Redo2 />, shortcut: "⇧⌘Z" },
      { type: "separator" },
      { id: "copy", label: "Duplicate", icon: <Copy /> },
      { id: "share", label: "Share", icon: <Share2 />, reserveLabels: ["Share", "Copied"] },
    ],
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["muted", "floating"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof FloatingButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Muted: Story = {};
export const Floating: Story = { args: { variant: "floating" } };
export const Small: Story = { args: { size: "sm" } };
export const IconOnly: Story = { args: { iconOnly: true } };

/** A tools rail: arrow up and down move focus, tooltips open beside it. */
export const ToolsRail: Story = {
  args: {
    orientation: "vertical",
    variant: "floating",
    iconOnly: true,
    label: "Tools",
    items: [
      { id: "select", label: "Select", icon: <MousePointer2 />, pressed: true, shortcut: "V" },
      { id: "hand", label: "Hand", icon: <Hand />, pressed: false, shortcut: "H" },
    ],
  },
};
