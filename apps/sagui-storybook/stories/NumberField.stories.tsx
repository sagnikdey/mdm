import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberField } from "@sagui/ui";

const meta = {
  title: "Special inputs/Number field",
  component: NumberField,
  tags: ["autodocs"],
  args: { label: "Seats", defaultValue: 5, min: 1, max: 10 },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithUnit: Story = { args: { suffix: (n: number) => (n === 1 ? " seat" : " seats") } };
export const Currency: Story = { args: { label: "Budget", prefix: "$", min: 0, max: 5000, step: 25, defaultValue: 400, formatOptions: { useGrouping: true } } };
export const Decimals: Story = { args: { label: "Opacity", min: 0, max: 1, step: 0.05, defaultValue: 0.5 } };
export const Scrubbable: Story = { args: { scrub: true, description: "Drag the label sideways to change the value." } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const Disabled: Story = { args: { disabled: true } };
