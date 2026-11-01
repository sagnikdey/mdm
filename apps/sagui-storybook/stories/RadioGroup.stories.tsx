import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "@sagui/ui";

import { figma } from "../.storybook/figma";
const meta = {
  title: "Form Elements/Radio Group",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { design: figma("57:9041"), layout: "padded" },
  args: {
    label: "Notifications",
    defaultValue: "mentions",
    options: [
      { value: "all", label: "All activity", description: "Every comment, edit and assignment." },
      { value: "mentions", label: "Mentions only", description: "Only when someone @mentions you." },
      { value: "none", label: "Nothing" },
    ],
  },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
