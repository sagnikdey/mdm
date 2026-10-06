import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagInput } from "@sagui/ui";

const meta = {
  title: "Special inputs/Tag input",
  component: TagInput,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Topics", defaultValue: ["design", "motion"] },
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
} satisfies Meta<typeof TagInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { defaultValue: [], placeholder: "Add a topic" } };
export const WithDescription: Story = { args: { description: "Press Enter or comma to add a tag." } };
export const WithError: Story = { args: { error: "Add at least three topics." } };
export const ManyTags: Story = { args: { defaultValue: ["design", "motion", "tokens", "accessibility", "react", "storybook", "typography", "layout", "color"] } };
