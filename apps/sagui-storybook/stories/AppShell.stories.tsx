import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, Building2, Handshake, LayoutDashboard, Settings, Target } from "lucide-react";
import { AppShell, Breadcrumb, MetricCard, NotificationCenter, UserMenu, type AppShellNavSection } from "@sagui/ui";

const nav: AppShellNavSection[] = [
  { items: [
    { label: "Overview", href: "#overview", icon: <LayoutDashboard /> },
    { label: "Pipeline", href: "#pipeline", icon: <Target /> },
    { label: "Deals", href: "#deals", icon: <Handshake />, badge: 12 },
    { label: "Accounts", href: "#accounts", icon: <Building2 /> },
  ] },
  { label: "Insights", items: [{ label: "Reports", href: "#reports", icon: <BarChart3 /> }] },
  { label: "Workspace", items: [{ label: "Settings", href: "#settings", icon: <Settings /> }] },
];

const meta = {
  title: "Navigation/App shell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    nav,
    currentHref: "#overview",
    brand: <span className="font-semibold">Sales</span>,
    brandMark: <span className="font-semibold">S</span>,
    header: <Breadcrumb items={[{ label: "Acme Inc.", href: "#overview" }, { label: "Overview" }]} />,
    actions: (
      <>
        <NotificationCenter notifications={[{ id: "n1", title: "Acme closed", description: "$42,000", time: "8m", tone: "success" }]} />
        <UserMenu user={{ name: "Sagnik Dey", email: "sagnik@example.com" }} onSignOut={() => {}} />
      </>
    ),
    children: (
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <MetricCard label="Revenue" value={128.4} prefix="$" suffix="k" decimals={1} change="+12.4%" context="vs last month" />
        <MetricCard label="Deals won" value={42} change="+6" context="vs last month" />
        <MetricCard label="Win rate" value={31.5} suffix="%" decimals={1} change="+2.1 pts" context="vs last month" />
      </div>
    ),
  },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Rail: Story = { args: { defaultCollapsed: true } };
export const NestedPage: Story = { args: { currentHref: "#deals/42" } };
export const Inset: Story = { args: { variant: "inset" } };
export const InsetRail: Story = { args: { variant: "inset", defaultCollapsed: true } };
