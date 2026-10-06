import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Input, Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@sagui/ui";

const meta = { title: "Overlays/Popover", component: Popover, tags: ["autodocs"], parameters: { layout: "padded" }, decorators: [(Story) => <div className="h-72"><Story /></div>] } satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline">Rename</Button></PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-3">
          <Input label="Project name" defaultValue="Atlas redesign" />
          <PopoverClose asChild><Button size="sm">Save</Button></PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
