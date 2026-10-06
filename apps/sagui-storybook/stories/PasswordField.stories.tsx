import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordField } from "@sagui/ui";

const meta = {
  title: "Inputs/Password field",
  component: PasswordField,
  tags: ["autodocs"],
  args: { label: "Password", autoComplete: "current-password" },
} satisfies Meta<typeof PasswordField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: "Use the password from your last sign in." } };
export const WithError: Story = { args: { error: "That password isn't right." } };
export const Disabled: Story = { args: { disabled: true } };
