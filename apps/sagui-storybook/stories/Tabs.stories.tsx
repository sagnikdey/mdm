import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sagui/ui";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-[480px]"><Story /></div>],
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">A summary of the project: owners, status and the latest milestone.</TabsContent>
      <TabsContent value="activity"><p>Recent changes by everyone on the team.</p><p className="mt-2">Pulled in every few minutes.</p></TabsContent>
      <TabsContent value="settings">Rename the project, change its visibility or archive it.</TabsContent>
    </Tabs>
  ),
};

export const Overflowing: Story = {
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
  render: () => (
    <Tabs defaultValue="t1">
      <TabsList aria-label="Months">
        {["January", "February", "March", "April", "May", "June", "July"].map((m, i) => <TabsTrigger key={m} value={`t${i + 1}`}>{m}</TabsTrigger>)}
      </TabsList>
      {["January", "February", "March", "April", "May", "June", "July"].map((m, i) => <TabsContent key={m} value={`t${i + 1}`}>{m} report.</TabsContent>)}
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList aria-label="Plans">
        <TabsTrigger value="a">Monthly</TabsTrigger>
        <TabsTrigger value="b">Yearly</TabsTrigger>
        <TabsTrigger value="c" disabled>Lifetime</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Billed every month.</TabsContent>
      <TabsContent value="b">Two months free.</TabsContent>
      <TabsContent value="c">Unavailable.</TabsContent>
    </Tabs>
  ),
};
