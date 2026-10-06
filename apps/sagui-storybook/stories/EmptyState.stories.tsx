import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Inbox, Search } from "lucide-react";
import { Button, EmptyState } from "@sagui/ui";

const meta = {
  title: "Cards/Empty state",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { title: "No projects yet", description: "Create your first project to start collaborating with your team.", action: <Button>New project</Button> },
  decorators: [(Story) => <div className="w-[420px] rounded-[var(--radius-xl)] border border-dashed border-border"><Story /></div>],
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Search_: Story = { name: "No results", args: { icon: <Search width={24} height={24} strokeWidth={1.5} />, title: "No results for “atlas”", description: "Try a shorter word or check the spelling.", action: <Button variant="outline">Clear search</Button> } };
export const Morphing: Story = {
  render: function Render() {
    const [done, setDone] = useState(false);
    return (
      <EmptyState
        icon={done ? <Inbox width={24} height={24} strokeWidth={1.5} /> : undefined}
        title={done ? "You are all caught up" : "No projects yet"}
        description={done ? "New activity will show up here." : "Create your first project to start collaborating."}
        action={<Button variant="outline" onClick={() => setDone((value) => !value)}>Toggle state</Button>}
      />
    );
  },
};
