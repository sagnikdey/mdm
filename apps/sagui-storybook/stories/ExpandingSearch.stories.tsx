import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Folder, User } from "lucide-react";
import { ExpandingSearch, type ExpandingSearchItem } from "@sagui/ui";

const items: ExpandingSearchItem[] = [
  { id: "1", title: "Atlas redesign", meta: "Project · edited today", group: "Projects", icon: <Folder size={18} /> },
  { id: "2", title: "Billing migration", meta: "Project · edited 3 days ago", group: "Projects", icon: <Folder size={18} /> },
  { id: "3", title: "Onboarding checklist", meta: "Doc · Maya", group: "Docs", icon: <FileText size={18} />, keywords: ["setup", "welcome"] },
  { id: "4", title: "Pricing page copy", meta: "Doc · Sam", group: "Docs", icon: <FileText size={18} /> },
  { id: "5", title: "Maya Chen", meta: "Design lead", group: "People", icon: <User size={18} /> },
  { id: "6", title: "Samir Patel", meta: "Engineering", group: "People", icon: <User size={18} /> },
];

const meta = {
  title: "Inputs/Expanding search",
  component: ExpandingSearch,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Search projects and docs", items },
  decorators: [(Story) => <div className="h-[420px] w-[560px]"><Story /></div>],
} satisfies Meta<typeof ExpandingSearch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSuggestions: Story = { args: { suggestions: items.slice(0, 3), suggestionsLabel: "Recent" } };
export const AnchoredStart: Story = { args: { anchor: "start" } };
