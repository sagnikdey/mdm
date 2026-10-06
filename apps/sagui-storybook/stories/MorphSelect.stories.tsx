import type { Meta, StoryObj } from "@storybook/react-vite";
import { MorphSelect } from "@sagui/ui";

const zones = ["Pacific", "Mountain", "Central", "Eastern", "Atlantic", "UTC", "London", "Paris", "Berlin", "Cairo", "Dubai", "Mumbai", "Singapore", "Tokyo", "Sydney"].map((name, index) => ({ value: name.toLowerCase(), label: name, meta: `UTC${index < 5 ? "-" : "+"}${(index % 8) + 1}` }));

const meta = {
  title: "Selection/Morph select",
  component: MorphSelect,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Time zone", items: zones, defaultValue: "london" },
  decorators: [(Story) => <div className="h-[420px] w-[360px]"><Story /></div>],
} satisfies Meta<typeof MorphSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Searchable: Story = {};
export const Grouped: Story = {
  args: {
    defaultValue: null,
    items: [
      { label: "Fruit", options: [{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }] },
      { label: "Vegetables", options: [{ value: "leek", label: "Leek" }, { value: "kale", label: "Kale" }] },
    ],
    label: "Produce",
  },
};
export const AlignEnd: Story = { args: { align: "end" } };
