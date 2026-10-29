import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { Badge, Button } from "@sagui/ui";

import { figma } from "../.storybook/figma";
const meta = {
  title: "Display/Badge",
  parameters: { design: figma("143:16728") },
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Active", tone: "success", size: "md" },
  argTypes: { tone: { control: "inline-radio", options: ["neutral", "success", "info", "warning", "danger"] }, size: { control: "inline-radio", options: ["sm", "md"] } },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Tones: Story = {
  render: () => <div className="flex gap-2">{(["neutral", "success", "info", "warning", "danger"] as const).map((t) => <Badge key={t} tone={t}>{t}</Badge>)}</div>,
};
export const WithIcon: Story = {
  render: (args) => <Badge {...args} icon={<Check size={12} />} />,
};
export const Small: Story = { args: { size: "sm" } };
export const Morphing: Story = {
  render: function Render() {
    const [done, setDone] = useState(false);
    return (
      <div className="flex items-center gap-4">
        <Badge tone={done ? "success" : "warning"} icon={done ? <Check size={12} /> : <Clock size={12} />}>{done ? "Deployed" : "Deploying"}</Badge>
        <Button variant="outline" onClick={() => setDone((d) => !d)}>Toggle</Button>
      </div>
    );
  },
};
