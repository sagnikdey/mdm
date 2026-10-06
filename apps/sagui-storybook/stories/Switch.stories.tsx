import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@sagui/ui";

const meta = {
  title: "Selection/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { label: "Auto-save drafts" },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const IconOnly: Story = { args: { label: undefined, "aria-label": "Dark mode" } };
