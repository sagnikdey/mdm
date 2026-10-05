import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@sagui/ui";

function ArrowIcon() {
  return (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>);
}
function PlusIcon() {
  return (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>);
}

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Continue" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "icon"] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Loading: Story = { args: { loading: true, children: "Saving" } };
export const Disabled: Story = { args: { disabled: true } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["primary", "secondary", "outline", "ghost", "danger"] as const).map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button><Button size="md">Medium</Button><Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button leadingIcon={<PlusIcon />}>New project</Button>
      <Button variant="outline" trailingIcon={<ArrowIcon />}>Continue</Button>
      <Button size="icon" variant="secondary" aria-label="Add"><PlusIcon /></Button>
    </div>
  ),
};

/** Click to save: the label crossfades and the width springs to fit. */
export const LabelMorph: Story = {
  render: function Render() {
    const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
    const label = { idle: "Save changes", saving: "Saving", saved: "Saved" }[state];
    return (
      <Button
        loading={state === "saving"}
        variant={state === "saved" ? "secondary" : "primary"}
        onClick={() => {
          setState("saving");
          setTimeout(() => setState("saved"), 1200);
          setTimeout(() => setState("idle"), 2600);
        }}
      >
        {label}
      </Button>
    );
  },
};
