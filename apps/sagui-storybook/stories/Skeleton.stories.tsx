import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@sagui/ui";

const meta = {
  title: "Cards/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { lines: 3 },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAvatar: Story = { args: { avatar: true } };
export const Revealed: Story = { args: { loading: false, children: <p className="text-sm">Acme renewal, $42,000</p> } };
