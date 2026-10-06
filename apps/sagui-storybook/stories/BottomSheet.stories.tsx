import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomSheet, BottomSheetClose, Button } from "@sagui/ui";

const meta = { title: "Overlays/Bottom sheet", component: BottomSheet, tags: ["autodocs"], parameters: { layout: "centered" } } satisfies Meta<typeof BottomSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Trip details", description: "Lisbon, 12 to 16 May", trigger: <Button>Open sheet</Button>, children: null },
  render: (args) => (
    <BottomSheet {...args}>
      <div className="grid gap-3">
        {Array.from({ length: 14 }, (_, index) => <div key={index} className="rounded-[var(--radius-md)] border border-border p-3">Itinerary item {index + 1}</div>)}
        <BottomSheetClose asChild><Button variant="outline">Done</Button></BottomSheetClose>
      </div>
    </BottomSheet>
  ),
};
export const ThreeDetents: Story = {
  ...Default,
  args: { ...Default.args, detents: [0.3, 0.6, 0.92], initialDetent: 1 },
};
