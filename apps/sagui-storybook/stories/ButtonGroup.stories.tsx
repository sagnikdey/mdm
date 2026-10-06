import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Archive, Check, Link, Minus, Plus, Share2, Star, Trash2 } from "lucide-react";
import { ButtonGroup } from "@sagui/ui";

const meta = {
  title: "Components/Button group",
  component: ButtonGroup,
  tags: ["autodocs"],
  args: {
    label: "Document actions",
    items: [
      { id: "edit", label: "Edit" },
      { id: "share", label: "Share", icon: <Share2 /> },
      { id: "star", label: "Star", icon: <Star /> },
    ],
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "solid"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {};
export const Solid: Story = { args: { variant: "solid" } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true } };

export const WithMenu: Story = {
  args: {
    menu: {
      label: "More actions",
      items: [
        { id: "archive", label: "Archive", icon: <Archive /> },
        { id: "link", label: "Copy link", icon: <Link /> },
        { id: "delete", label: "Delete", icon: <Trash2 />, destructive: true },
      ],
    },
  },
};

/** The label answers in place: "Share" reserves "Copied", so the segment never resizes. */
export const ConfirmInPlace: Story = {
  render: function Render() {
    const [copied, setCopied] = useState(false);
    return (
      <ButtonGroup
        label="Share actions"
        items={[
          { id: "edit", label: "Edit" },
          { id: "share", label: copied ? "Copied" : "Share", reserve: ["Share", "Copied"], icon: copied ? <Check /> : <Link />, onSelect: () => { setCopied(true); setTimeout(() => setCopied(false), 1600); } },
        ]}
      />
    );
  },
};

export const ZoomControls: Story = {
  render: function Render() {
    const [zoom, setZoom] = useState(100);
    return (
      <ButtonGroup
        label="Zoom"
        orientation="vertical"
        items={[
          { id: "in", label: "Zoom in", icon: <Plus />, iconOnly: true, onSelect: () => setZoom((z) => Math.min(200, z + 25)) },
          { id: "level", label: "Zoom level", content: `${zoom}%`, disabled: true },
          { id: "out", label: "Zoom out", icon: <Minus />, iconOnly: true, onSelect: () => setZoom((z) => Math.max(25, z - 25)) },
        ]}
      />
    );
  },
};
