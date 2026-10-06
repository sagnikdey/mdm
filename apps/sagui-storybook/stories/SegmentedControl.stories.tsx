import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl } from "@sagui/ui";

const meta = {
  title: "Selection/Segmented control",
  component: SegmentedControl,
  tags: ["autodocs"],
  args: {
    label: "View",
    defaultValue: "board",
    options: [{ value: "list", label: "List" }, { value: "board", label: "Board" }, { value: "timeline", label: "Timeline" }],
  },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAccessory: Story = {
  args: {
    options: [
      { value: "all", label: "All", accessory: <span className="text-xs text-muted-foreground">24</span> },
      { value: "open", label: "Open", accessory: <span className="text-xs text-muted-foreground">9</span> },
      { value: "closed", label: "Closed" },
    ],
    defaultValue: "all",
  },
};
export const Overflowing: Story = {
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { options: ["Day", "Week", "Month", "Quarter", "Year", "All time"].map((label) => ({ value: label.toLowerCase(), label })), defaultValue: "day" },
};
