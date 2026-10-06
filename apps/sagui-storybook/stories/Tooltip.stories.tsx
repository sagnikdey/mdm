import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Tooltip } from "@sagui/ui";

const meta = { title: "Overlays/Tooltip", component: Tooltip, tags: ["autodocs"], parameters: { layout: "centered" } } satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { content: "Create a new project", children: <Button variant="outline">New project</Button> } };
export const Sides: Story = {
  args: { content: "Opens here", children: <span /> },
  render: () => (
    <div className="flex gap-3 py-10">
      {(["top", "right", "bottom", "left"] as const).map((side) => <Tooltip key={side} side={side} content={`Opens ${side}`}><Button variant="outline" size="sm">{side}</Button></Tooltip>)}
    </div>
  ),
};
/** The text crossfades and the bubble springs to its new size while open. */
export const ChangingText: Story = {
  args: { content: "", children: <span /> },
  render: function Render() {
    const [copied, setCopied] = useState(false);
    return (
      <Tooltip content={copied ? "Copied to clipboard" : "Copy link"}>
        <Button variant="outline" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}>Copy</Button>
      </Tooltip>
    );
  },
};
