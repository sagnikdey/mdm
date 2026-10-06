import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PasswordStrength } from "@sagui/ui";

const meta = {
  title: "Inputs/Password strength",
  component: PasswordStrength,
  tags: ["autodocs"],
  args: { label: "New password" },
} satisfies Meta<typeof PasswordStrength>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const StartsFilled: Story = { args: { defaultValue: "Sunlit-Harbor-4821!" } };
export const WithError: Story = { args: { error: "This password appeared in a data breach." } };
export const CustomRules: Story = {
  args: {
    rules: [
      { id: "length", label: "At least 10 characters", test: (p: string) => p.length >= 10, remaining: (p: string) => Math.max(0, 10 - p.length) },
      { id: "digit", label: "Contains a digit", test: (p: string) => /\d/.test(p) },
    ],
  },
};
export const ControlledReveal: Story = {
  render: function Render() {
    const [revealed, setRevealed] = useState(false);
    return <PasswordStrength label="New password" revealed={revealed} onRevealedChange={setRevealed} />;
  },
};
