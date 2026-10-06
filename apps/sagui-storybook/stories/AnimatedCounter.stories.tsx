import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AnimatedCounter, Button } from "@sagui/ui";

const meta = { title: "Cards/Animated counter", component: AnimatedCounter, tags: ["autodocs"], args: { value: 1280, label: "Orders" } } satisfies Meta<typeof AnimatedCounter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Money: Story = { args: { value: 4820.5, prefix: "$", decimals: 2 } };
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(1280);
    return (
      <div className="grid gap-4">
        <AnimatedCounter {...args} value={value} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setValue((v) => v + 487)}>Add</Button>
          <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 1000))}>Subtract</Button>
        </div>
      </div>
    );
  },
};
