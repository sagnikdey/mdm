import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "@sagui/ui";

const meta = {
  title: "Selection/Radio group",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
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
