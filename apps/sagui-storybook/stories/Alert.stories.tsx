import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Alert, Button } from "@sagui/ui";

const meta = {
  title: "Messages/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { title: "Your trial ends in 3 days", children: "Add a payment method to keep your projects.", tone: "info" },
  argTypes: { tone: { control: "inline-radio", options: ["info", "success", "warning", "danger"] } },
  decorators: [(Story) => <div className="w-[480px]"><Story /></div>],
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = { args: { tone: "success", title: "Changes published", children: "Everyone with the link can see them." } };
export const Warning: Story = { args: { tone: "warning", title: "Storage almost full", children: "You have used 92% of your 10 GB." } };
export const Danger: Story = { args: { tone: "danger", title: "Payment failed", children: "Your card was declined." } };
export const TitleOnly: Story = { args: { children: undefined } };
export const Dismissible: Story = { args: { onDismiss: () => {} } };
export const Rewording: Story = {
  render: function Render() {
    const [tone, setTone] = useState<"info" | "success">("info");
    return (
      <div className="grid gap-3">
        <Alert tone={tone} title={tone === "info" ? "Saving your work" : "All changes saved"}>{tone === "info" ? "This takes a moment." : "You can close this tab."}</Alert>
        <Button variant="outline" onClick={() => setTone((t) => (t === "info" ? "success" : "info"))}>Toggle</Button>
      </div>
    );
  },
};
