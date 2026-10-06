import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@sagui/ui";

const meta = { title: "Overlays/Drawer", component: Drawer, tags: ["autodocs"] } satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

const body = (
  <div className="grid gap-4">
    <p className="text-muted-foreground">Drag the header toward the edge to dismiss, or press Escape.</p>
    <DrawerClose asChild><Button>Apply filters</Button></DrawerClose>
  </div>
);

export const Right: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Filters</Button></DrawerTrigger>
      <DrawerContent title="Filters" description="Narrow the list of projects.">{body}</DrawerContent>
    </Drawer>
  ),
};
export const Left: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Menu</Button></DrawerTrigger>
      <DrawerContent side="left" title="Navigation">{body}</DrawerContent>
    </Drawer>
  ),
};
export const Bottom: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Share</Button></DrawerTrigger>
      <DrawerContent side="bottom" title="Share project">{body}</DrawerContent>
    </Drawer>
  ),
};
