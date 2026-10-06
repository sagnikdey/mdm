import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyButton } from "@sagui/ui";

const meta = {
  title: "Components/Copy button",
  component: CopyButton,
  tags: ["autodocs"],
  args: { value: "npm install @sagui/ui" },
  argTypes: { variant: { control: "inline-radio", options: ["outline", "plain"] } },
} satisfies Meta<typeof CopyButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Plain: Story = { args: { variant: "plain" } };
export const IconOnly: Story = { args: { iconOnly: true } };
export const CustomLabel: Story = { args: { label: "Copy link" } };
export const Disabled: Story = { args: { disabled: true } };
