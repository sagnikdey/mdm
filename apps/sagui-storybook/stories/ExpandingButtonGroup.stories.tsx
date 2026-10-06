import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Reply, Star, Trash2 } from "lucide-react";
import { ExpandingButtonGroup } from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Components/Expanding button group",
  component: ExpandingButtonGroup,
  tags: ["autodocs"],
  args: {
    label: "Message actions",
    items: [
      { id: "reply", label: "Reply", icon: <Reply /> },
      { id: "star", label: "Star", icon: <Star />, doneLabel: "Starred" },
      { id: "archive", label: "Archive", icon: <Archive />, doneLabel: "Archived", onSelect: () => wait(700) },
      { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger", doneLabel: "Deleted" },
    ],
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] } },
} satisfies Meta<typeof ExpandingButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const RestOnArchive: Story = { args: { defaultExpanded: "archive" } };
