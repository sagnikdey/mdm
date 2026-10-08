import type { Meta, StoryObj } from "@storybook/react-vite";
import { SortableDataTable } from "@sagui/ui";
import { projects } from "./sample-data";

const meta = {
  title: "Data/Sortable data table",
  component: SortableDataTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { caption: "Projects", rows: projects, rowKey: "id", columns: [{ key: "name", label: "Name" }, { key: "owner", label: "Owner" }, { key: "status", label: "Status" }, { key: "budget", label: "Budget", render: (value: unknown) => `$${Number(value).toLocaleString("en-US")}` }], defaultSort: { key: "name", direction: "asc" } },
  decorators: [(Story) => <div className="w-[720px] max-w-full"><Story /></div>],
} satisfies Meta<typeof SortableDataTable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selectable: Story = { args: { selectable: true, itemName: { one: "project", other: "projects" } } };
export const WithToolbar: Story = { args: { searchable: true, viewOptions: true, columns: [{ key: "name", label: "Name" }, { key: "owner", label: "Owner", filterable: true }, { key: "status", label: "Status", filterable: true }, { key: "budget", label: "Budget", searchable: false, render: (value: unknown) => `$${Number(value).toLocaleString("en-US")}` }] } };
export const Empty: Story = { args: { rows: [] } };
