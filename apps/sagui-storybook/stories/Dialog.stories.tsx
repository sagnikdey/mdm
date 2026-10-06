import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Dialog, DialogClose, DialogContent, DialogTrigger } from "@sagui/ui";

const meta = { title: "Overlays/Dialog", component: Dialog, tags: ["autodocs"] } satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>Delete project</Button></DialogTrigger>
      <DialogContent title="Delete Atlas redesign?" description="This removes the project and its 14 files for everyone.">
        <p className="mb-5 text-muted-foreground">You can restore it from the trash for 30 days.</p>
        <div className="flex justify-end gap-2">
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <DialogClose asChild><Button variant="danger">Delete</Button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};
