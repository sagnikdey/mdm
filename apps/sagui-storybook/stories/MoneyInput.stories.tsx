import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MoneyInput } from "@sagui/ui";

const meta = {
  title: "Special inputs/Money input",
  component: MoneyInput,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Amount", defaultValue: 12500 },
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
} satisfies Meta<typeof MoneyInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { defaultValue: null } };
export const WithLimits: Story = { args: { min: 500, max: 100000, description: "Per transfer." } };
export const Euro: Story = { args: { defaultCurrency: "EUR", locale: "de-DE" } };
export const Yen: Story = { args: { defaultCurrency: "JPY", defaultValue: 4800 } };
export const SingleCurrency: Story = { args: { currencies: ["USD"], quickAdd: [] } };
export const Disabled: Story = { args: { disabled: true } };
export const MinorUnits: Story = {
  render: function Render() {
    const [value, setValue] = useState<number | null>(1250);
    return <div className="grid gap-3"><MoneyInput label="Amount" value={value} onValueChange={(next) => setValue(next)} /><code className="text-xs text-muted-foreground">value = {String(value)}</code></div>;
  },
};
