import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Input } from "@sagui/ui";

const meta = {
  title: "Inputs/Input",
  component: Input,
  tags: ["autodocs"],
  args: { label: "Project name", placeholder: "Untitled project" },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: "Shown on invoices and in the sidebar." } };
export const WithError: Story = { args: { error: "A project with this name already exists." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Atlas" } };

/** Helper and error copy open their rows on a spring, and a count in the copy rolls its digits. */
export const LiveCount: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    return <Input label="Short bio" value={value} onChange={(event) => setValue(event.target.value)} description={`${value.length} characters`} error={value.length > 20 ? "Keep it under 20 characters." : undefined} />;
  },
};
