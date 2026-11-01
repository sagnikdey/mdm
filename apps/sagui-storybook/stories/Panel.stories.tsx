import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Input, Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from "@sagui/ui";

import { figma } from "../.storybook/figma";

const meta = {
  title: "Cards/Panel",
  component: Panel,
  tags: ["autodocs"],
  parameters: { design: figma("355:27"), layout: "padded" },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
} satisfies Meta<typeof Panel>;
export default meta;
type Story = StoryObj<typeof meta>;

const body = (
  <>
    <PanelHeader action={<Button variant="outline" size="sm">Edit</Button>}>
      <PanelTitle>Banking</PanelTitle>
      <PanelDescription>Account ending 4821</PanelDescription>
    </PanelHeader>
    <PanelContent className="text-sm text-fg-muted">Payments settle within two business days.</PanelContent>
  </>
);

export const Flat: Story = { args: { children: body } };
export const Resting: Story = { args: { elevation: "resting", children: body } };
export const Raised: Story = { args: { elevation: "raised", children: body } };
export const Form: Story = {
  args: {
    as: "form",
    children: (
      <>
        <PanelHeader><PanelTitle>Company profile</PanelTitle></PanelHeader>
        <PanelContent><Input label="Legal name" defaultValue="Northwind Foods" /></PanelContent>
        <PanelFooter><Button variant="ghost" type="button">Cancel</Button><Button type="button">Save</Button></PanelFooter>
      </>
    ),
  },
};
