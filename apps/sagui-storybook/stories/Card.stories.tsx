import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar, Button, Card } from "@sagui/ui";

/** Photos from Unsplash (free to use under the Unsplash License), served at card width. */
const unsplash = (id: string, width: number, height: number) => `https://images.unsplash.com/${id}?w=${width}&h=${height}&q=80&auto=format&fit=crop`;
const officePhoto = unsplash("photo-1497366216548-37526070297c", 640, 320);
const dashboardPhoto = unsplash("photo-1460925895917-afdab827c52f", 640, 320);
const mayaPhoto = unsplash("photo-1494790108377-be9c29b29330", 96, 96);
const samirPhoto = unsplash("photo-1507003211169-0a1dd7228f2d", 96, 96);
const photo = <img src={officePhoto} alt="A bright, empty office corridor" width={640} height={320} className="block h-40 w-full object-cover" />;
const avatar = <Avatar name="Maya Chen" src={mayaPhoto} size="sm" />;

const meta = {
  title: "Cards/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { title: "Atlas redesign", description: "A quiet redesign of the workspace home.", meta: "Maya Chen", status: "Updated 2 hours ago" },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithMedia: Story = { args: { media: photo, avatar } };
export const SecondPhoto: Story = { args: { title: "Billing migration", description: "Moving invoices to the new provider.", meta: "Samir Patel", media: <img src={dashboardPhoto} alt="A laptop showing a revenue dashboard" width={640} height={320} className="block h-40 w-full object-cover" />, avatar: <Avatar name="Samir Patel" src={samirPhoto} size="sm" /> } };
export const WithAction: Story = { args: { action: <Button size="sm" variant="outline">Open</Button> } };
export const QuickLook: Story = {
  args: {
    media: photo,
    avatar,
    details: <p>Everything the team needs to review the redesign: goals, open questions, and the launch checklist.</p>,
    action: <Button size="sm" variant="outline">Share</Button>,
  },
};
export const ChangingStatus: Story = {
  render: function Render(args) {
    const [saved, setSaved] = useState(false);
    return (
      <div className="grid gap-3">
        <Card {...args} status={saved ? "Saved just now" : "Updated 2 hours ago"} />
        <Button variant="outline" size="sm" onClick={() => setSaved((value) => !value)}>Toggle status</Button>
      </div>
    );
  },
};
