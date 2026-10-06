import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import { ConfirmMorph } from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Components/Confirm morph",
  component: ConfirmMorph,
  tags: ["autodocs"],
  args: { label: "Delete", icon: <Trash2 />, prompt: "Delete 3 files?", onConfirm: () => wait(900), onUndo: () => wait(600) },
  argTypes: { tone: { control: "inline-radio", options: ["danger", "neutral"] } },
} satisfies Meta<typeof ConfirmMorph>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Press Delete: it asks in place, works, then offers Undo. */
export const Default: Story = {};
export const Neutral: Story = {
  args: { tone: "neutral", label: "Discard draft", icon: undefined, prompt: "Discard this draft?", confirmLabel: "Discard", pendingLabel: "Discarding", doneLabel: "Discarded" },
};
export const FailsThenRetries: Story = {
  args: { onConfirm: async () => { await wait(700); throw new Error("Network down"); }, onUndo: undefined },
};
export const Disabled: Story = { args: { disabled: true } };
