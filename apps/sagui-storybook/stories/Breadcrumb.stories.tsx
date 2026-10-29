import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Breadcrumb } from "@sagui/ui";

import { figma } from "../.storybook/figma";
const meta = {
  title: "Navigation/Breadcrumb",
  parameters: { design: figma("58:10327") },
  component: Breadcrumb,
  tags: ["autodocs"],
  args: { items: [{ label: "Home", href: "#" }, { label: "Projects", href: "#" }, { label: "Apollo" }] },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LocalState: Story = {
  render: function Render() {
    const all = ["Files", "Design", "Brand", "Logos"];
    const [depth, setDepth] = useState(2);
    return (
      <div className="grid gap-4">
        <Breadcrumb items={all.slice(0, depth).map((label, i) => ({ label, onClick: () => setDepth(i + 1) }))} />
        <button type="button" className="w-fit rounded-md border border-border-default px-3 py-1 text-sm" onClick={() => setDepth((d) => (d % all.length) + 1)}>Go deeper</button>
      </div>
    );
  },
};
