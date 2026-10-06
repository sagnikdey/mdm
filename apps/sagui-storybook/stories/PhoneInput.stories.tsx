import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PhoneInput } from "@sagui/ui";

const meta = {
  title: "Special inputs/Phone input",
  component: PhoneInput,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Phone number" },
  decorators: [(Story) => <div className="h-[420px] w-[360px]"><Story /></div>],
} satisfies Meta<typeof PhoneInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Prefilled: Story = { args: { defaultValue: "+447400123456" } };
export const WithDescription: Story = { args: { description: "We only use this for sign-in codes." } };
export const LimitedCountries: Story = { args: { countries: ["US", "CA", "MX"], preferredCountries: ["US"] } };
export const Disabled: Story = { args: { disabled: true } };
export const E164Output: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    return <div className="grid gap-3"><PhoneInput label="Phone number" onValueChange={setValue} /><code className="text-xs text-muted-foreground">e164 = {value || "(empty)"}</code></div>;
  },
};
