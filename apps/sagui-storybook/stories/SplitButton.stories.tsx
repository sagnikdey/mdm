import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Check, Copy, Download, Link, Trash2 } from "lucide-react";
import { SplitButton } from "@sagui/ui";

const meta = {
  title: "Components/Split button",
  component: SplitButton,
  tags: ["autodocs"],
  args: {
    label: "Save",
    actions: [{ label: "Save as draft" }, { label: "Save and close" }, { label: "Discard changes", destructive: true, icon: <Trash2 /> }],
  },
  argTypes: { variant: { control: "inline-radio", options: ["primary", "secondary"] } },
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Disabled: Story = { args: { disabled: true } };

/** The main action morphs its icon and label while the menu half stays still. */
export const CopyPage: Story = {
  render: function Render() {
    const [copied, setCopied] = useState(false);
    return (
      <SplitButton
        variant="secondary"
        label={copied ? "Copied" : "Copy page"}
        icon={copied ? <Check /> : <Copy />}
        onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}
        actions={[{ label: "Copy link", icon: <Link /> }, { label: "Download markdown", icon: <Download /> }]}
      />
    );
  },
};
