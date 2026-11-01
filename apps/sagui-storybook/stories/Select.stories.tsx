import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@sagui/ui";

import { figma } from "../.storybook/figma";
const meta = {
  title: "Form Elements/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { design: figma("58:9409"), layout: "padded" },
  args: {
    label: "Role",
    options: [
      { value: "viewer", label: "Viewer" },
      { value: "editor", label: "Editor" },
      { value: "admin", label: "Admin" },
      { value: "owner", label: "Owner", disabled: true },
    ],
  },
  decorators: [(Story) => <div className="h-[320px] w-[320px]"><Story /></div>],
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: "editor", description: "Editors can change content." } };
export const WithError: Story = { args: { error: "Choose a role." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "viewer" } };
