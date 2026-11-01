import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "@sagui/ui";

import { figma } from "../.storybook/figma";

const labels = ["Company profile", "Contacts", "Addresses", "Product categories", "Commercial terms", "Compliance documents", "Banking", "Review and submit"];
const steps = labels.map((label) => ({ label }));

const meta = {
  title: "Navigation/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: { design: figma("269:79"), layout: "padded" },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { steps, current: 0 },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InProgress: Story = { args: { current: 3 } };
export const WithError: Story = {
  args: { current: 5, steps: steps.map((step, index) => (index === 2 ? { ...step, error: true } : step)) },
};
