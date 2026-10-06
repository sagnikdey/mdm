import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "@sagui/ui";

const meta = {
  title: "Selection/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { label: "Email me product updates" },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = { args: { description: "At most one email a month." } };
export const Indeterminate: Story = { args: { checked: "indeterminate" } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const SelectAll: Story = {
  render: function Render() {
    const [items, setItems] = useState({ a: true, b: false, c: false });
    const values = Object.values(items);
    const all = values.every(Boolean);
    const some = values.some(Boolean);
    return (
      <div className="grid gap-1">
        <Checkbox label="Select all" checked={all ? true : some ? "indeterminate" : false} onCheckedChange={(next) => setItems({ a: next === true, b: next === true, c: next === true })} />
        <div className="ml-6 grid gap-1">
          {(["a", "b", "c"] as const).map((key) => (
            <Checkbox key={key} label={`Item ${key.toUpperCase()}`} checked={items[key]} onCheckedChange={(next) => setItems((last) => ({ ...last, [key]: next === true }))} />
          ))}
        </div>
      </div>
    );
  },
};
