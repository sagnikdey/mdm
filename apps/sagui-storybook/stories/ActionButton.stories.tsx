import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionButton } from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Components/Action button",
  component: ActionButton,
  tags: ["autodocs"],
  args: { label: "Publish", pendingLabel: "Publishing", successLabel: "Published", onAction: () => wait(1200) },
} satisfies Meta<typeof ActionButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Press to run: the label morphs through pending and success, and the arrow becomes a drawn check. */
export const Default: Story = {};
export const StaysOnSuccess: Story = { args: { resetAfterMs: 0 } };
export const Error: Story = {
  args: { onAction: async () => { await wait(800); throw new globalThis.Error("Network down"); }, onActionError: () => {} },
};
export const Disabled: Story = { args: { disabled: true } };
