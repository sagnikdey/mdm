import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SearchField } from "@sagui/ui";

const meta = {
  title: "Inputs/Search field",
  component: SearchField,
  tags: ["autodocs"],
  args: { label: "Search components", placeholder: "Search", value: "", onValueChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SearchField {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { value: "button" } };
