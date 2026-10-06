import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "@sagui/ui";

const meta = {
  title: "Selection/Multi-select",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    label: "Teams",
    defaultValue: ["design", "eng"],
    options: [
      { value: "design", label: "Design" },
      { value: "eng", label: "Engineering" },
      { value: "product", label: "Product" },
      { value: "support", label: "Support" },
      { value: "finance", label: "Finance", disabled: true },
    ],
  },
  decorators: [(Story) => <div className="h-[340px] w-[340px]"><Story /></div>],
} satisfies Meta<typeof MultiSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { defaultValue: [] } };
export const ManySelected: Story = { args: { defaultValue: ["design", "eng", "product", "support"] } };
export const WithError: Story = { args: { defaultValue: [], error: "Pick at least one team." } };
