import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { InlineEdit } from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Inputs/Inline edit",
  component: InlineEdit,
  tags: ["autodocs"],
  args: { value: "Atlas redesign", label: "Project name", onSave: () => wait(700) },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <InlineEdit {...args} value={value} onSave={async (next) => { await args.onSave(next); setValue(next); }} />;
  },
} satisfies Meta<typeof InlineEdit>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = { args: { as: "h2" } };
export const Body: Story = { args: { variant: "body", label: "Description", value: "A quiet redesign of the workspace home.", placeholder: "Add a description" } };
export const Multiline: Story = { args: { variant: "body", multiline: true, label: "Description", value: "Notes for the team.\nWrap onto more lines as you type." } };
export const Validated: Story = { args: { validate: (next: string) => (next.length < 3 ? "Use at least 3 characters." : null) } };
export const SaveFails: Story = { args: { onSave: async () => { await wait(700); throw new Error("offline"); } } };
