import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Textarea } from "@sagui/ui";

const meta = {
  title: "Inputs/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { label: "Notes", placeholder: "Anything the team should know" },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithError: Story = { args: { error: "Notes can't be empty." } };
export const Disabled: Story = { args: { disabled: true } };
export const LiveCount: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    return <Textarea label="Description" value={value} onChange={(event) => setValue(event.target.value)} description={`${value.length} of 200 characters`} />;
  },
};
