import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@sagui/ui";

const photo = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#7c9cf0"/><circle cx="32" cy="26" r="12" fill="#fff"/><path d="M10 64c2-16 14-22 22-22s20 6 22 22z" fill="#fff"/></svg>');

const meta = {
  title: "Data display/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Ada Lovelace", size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] }, status: { control: "inline-radio", options: [undefined, "online", "offline"] } },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Photo: Story = { args: { src: photo } };
export const BrokenPhoto: Story = { args: { src: "/missing.png" } };
export const WithStatus: Story = { args: { status: "online" } };
export const Sizes: Story = {
  render: () => <div className="flex items-end gap-3">{(["sm", "md", "lg", "xl"] as const).map((s) => <Avatar key={s} name="Grace Hopper" size={s} status="online" />)}</div>,
};
