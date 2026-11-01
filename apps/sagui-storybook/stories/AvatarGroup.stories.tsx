import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useState } from "react";
import { AvatarGroup, Button } from "@sagui/ui";

import { figma } from "../.storybook/figma";
const people = ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson", "Linus Torvalds", "Margaret Hamilton", "Dennis Ritchie"].map((name) => ({ name }));

function withTopPadding(Story: () => React.JSX.Element) {
  return (
    <div className="pt-10">
      <Story />
    </div>
  );
}

const meta = {
  title: "Display/Avatar Group",
  component: AvatarGroup,
  tags: ["autodocs"],
  parameters: { design: figma("135:16075"), layout: "padded" },
  args: { members: people, max: 4, size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [withTopPadding],
} satisfies Meta<typeof AvatarGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoOverflow: Story = { args: { members: people.slice(0, 3) } };
export const Joining: Story = {
  render: function Render(args) {
    const [n, setN] = useState(3);
    return (
      <div className="grid gap-4">
        <AvatarGroup {...args} members={people.slice(0, n)} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setN((v) => Math.min(people.length, v + 1))}>Add</Button>
          <Button variant="outline" onClick={() => setN((v) => Math.max(1, v - 1))}>Remove</Button>
        </div>
      </div>
    );
  },
};
