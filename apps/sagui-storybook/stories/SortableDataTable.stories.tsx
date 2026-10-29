import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Button, SortableDataTable, type DataColumn } from "@sagui/ui";
import { projects } from "./sample-data";

import { figma } from "../.storybook/figma";
const meta = {
  title: "Data Table",
  component: SortableDataTable,
  tags: ["autodocs"],
  parameters: { docs: { slug: "sortable-data-table" }, design: figma("115:8663"), layout: "padded" },
  args: { caption: "Projects", rows: projects, rowKey: "id", columns: [{ key: "name", label: "Name" }, { key: "owner", label: "Owner" }, { key: "status", label: "Status" }, { key: "budget", label: "Budget", render: (value: unknown) => `$${Number(value).toLocaleString("en-US")}` }], defaultSort: { key: "name", direction: "asc" } },
} satisfies Meta<typeof SortableDataTable>;
export default meta;
type Story = StoryObj<typeof meta>;

const narrow = [(Story: () => React.ReactElement) => <div className="w-[720px] max-w-full"><Story /></div>];

export const Default: Story = { decorators: narrow };
export const Selectable: Story = { args: { selectable: true, itemName: { one: "project", other: "projects" } }, decorators: narrow };
export const WithToolbar: Story = { args: { searchable: true, viewOptions: true, columns: [{ key: "name", label: "Name" }, { key: "owner", label: "Owner", filterable: true }, { key: "status", label: "Status", filterable: true }, { key: "budget", label: "Budget", searchable: false, render: (value: unknown) => `$${Number(value).toLocaleString("en-US")}` }] }, decorators: narrow };
export const ResizableColumns: Story = { args: { resizableColumns: true }, decorators: narrow };
export const Empty: Story = { args: { rows: [] }, decorators: narrow };

/* ---------- Product performance: the table drawn in Figma ("Data Table — Documentation") ---------- */

interface Product { rank: number; name: string; category: string; revenue: number; units: number; change: number; margin: number; cover: number }

/** The ten rows from the Figma doc frame, so design and code show the same data. */
const products: Product[] = [
  ["Energy Drink - Berry Blast 16oz", "Energy Drinks", 21860, 6505, 12.3, 44.7, 12],
  ["Lemon Lime Soda 20oz", "Soft Drinks", 20386, 8880, -8.3, 48.2, 16],
  ["Sports Drink - Citrus 20oz", "Water & Hydration", 19370, 7697, -10.1, 55.4, 15],
  ["Cola Classic 12oz", "Soft Drinks", 17951, 8980, -9.1, 47.8, 16],
  ["Cola Zero Sugar 12oz", "Soft Drinks", 17521, 8748, -9.4, 47.6, 13],
  ["Bottled Coffee - Iced 16oz", "Coffee & Hot Drinks", 17200, 4899, 10.6, 63.1, 13],
  ["Ham & Swiss Wrap", "Sandwiches", 15939, 2285, 0.3, 34.6, 17],
  ["Turkey & Cheese Sandwich", "Sandwiches", 15843, 2083, -1.9, 35.9, 15],
  ["Chicken Sandwich", "Sandwiches", 15659, 2215, -2.1, 36.4, 11],
  ["Espresso Shot - Double", "Coffee & Hot Drinks", 15265, 5035, 7.8, 62.1, 15],
].map(([name, category, revenue, units, change, margin, cover], i) => ({ rank: i + 1, name, category, revenue, units, change, margin, cover }) as Product);

/** Success at +2% or more, danger at −2% or less, neutral between — the rule in the Figma doc. */
const changeTone = (value: number) => (value >= 2 ? "success" : value <= -2 ? "danger" : "neutral");
const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}%`;

const productColumns: DataColumn<Product>[] = [
  { key: "rank", label: "#", numeric: true, width: 56, hideable: false, searchable: false },
  { key: "name", label: "Product", hideable: false, width: 280, render: (value) => <span className="font-medium">{String(value)}</span> },
  { key: "category", label: "Category", filterable: true, width: 180 },
  { key: "revenue", label: "Revenue", numeric: true, searchable: false, render: (value) => `$${Number(value).toLocaleString("en-US")}` },
  { key: "units", label: "Units", numeric: true, searchable: false, render: (value) => Number(value).toLocaleString("en-US") },
  { key: "change", label: "Change", numeric: true, searchable: false, render: (value) => <Badge size="sm" tone={changeTone(Number(value))}>{signed(Number(value))}</Badge> },
  { key: "margin", label: "Margin", numeric: true, searchable: false, render: (value) => `${Number(value).toFixed(1)}%` },
  { key: "cover", label: "Cover", numeric: true, searchable: false, render: (value) => `${value} d` },
  { key: "action", label: "Action", sortable: false, searchable: false, hideable: false, render: () => <Button size="sm" variant="outline">Act</Button> },
];

const wide = [(Story: () => React.ReactElement) => <div className="w-[1240px] max-w-full"><Story /></div>];

/** Mirrors the Figma Data Table: toolbar with search, Filter (Category) and View, rank sorted ascending. */
export const ProductPerformance: Story = {
  name: "Product performance",
  args: {
    caption: "Product performance",
    rows: products as never,
    rowKey: "rank" as never,
    columns: productColumns as never,
    defaultSort: { key: "rank", direction: "asc" },
    searchable: true,
    searchPlaceholder: "Search products",
    viewOptions: true,
    itemName: { one: "product", other: "products" },
  },
  decorators: wide,
};

/** The "Filtered" row of the Figma doc: search for "cola" and the footer offers Clear filters. */
export const ProductPerformanceFiltered: Story = {
  name: "Product performance · filtered",
  args: { ...ProductPerformance.args, defaultSearch: "cola" },
  decorators: wide,
};

/** The "Selected rows" row of the Figma doc. */
export const ProductPerformanceSelected: Story = {
  name: "Product performance · selected rows",
  args: { ...ProductPerformance.args, selectable: true, defaultSelectedKeys: ["2", "3", "5"] },
  decorators: wide,
};

/* ---------- Mobile: below 620px rows fold into two lines ---------- */

/**
 * The phone layout of Product performance. Rank and the row action are hidden, so the product leads line one with
 * revenue on the right, and category, units, change, margin and cover sit on line two. Tap the strip to sort.
 */
export const ProductPerformanceMobile: Story = {
  name: "Product performance · mobile",
  args: { ...ProductPerformance.args, columns: productColumns.filter((c) => c.key !== "rank" && c.key !== "action") as never, defaultSort: { key: "revenue", direction: "desc" } },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  parameters: { layout: "fullscreen", design: figma("130:8576") },
  decorators: [(Story) => <div className="p-3"><Story /></div>],
};

/** Mobile with selection: the checkbox sits at the start of each row and Select all stays pinned in the sort strip. */
export const ProductPerformanceMobileSelected: Story = {
  name: "Product performance · mobile, selected rows",
  args: { ...ProductPerformanceMobile.args, selectable: true, defaultSelectedKeys: ["2", "3", "5"] },
  globals: ProductPerformanceMobile.globals,
  parameters: ProductPerformanceMobile.parameters,
  decorators: ProductPerformanceMobile.decorators,
};
