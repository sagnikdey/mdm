import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Toast } from "@sagui/ui";

const meta = {
  title: "Messages/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { title: "Project saved", description: "Atlas redesign is up to date." },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { description: undefined } };
export const Triggered: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div className="grid h-40 content-between gap-4">
        <Button onClick={() => setOpen(true)}>Save project</Button>
        <Toast open={open} onOpenChange={setOpen} title="Project saved" description="Closes itself, or swipe it away." />
      </div>
    );
  },
};
