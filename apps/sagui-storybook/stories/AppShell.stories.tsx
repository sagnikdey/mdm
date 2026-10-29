import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, Building2, File, Handshake, Home, LayoutDashboard, LayoutGrid, List, Plus, Search, Settings, Target, Users } from "lucide-react";
import { useState } from "react";
import { AppShell, Avatar, Badge, Breadcrumb, Button, Checkbox, MetricCard, NotificationCenter, SearchField, UserMenu, type AppShellNavSection } from "@sagui/ui";

import { figma } from "../.storybook/figma";
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
  parameters: { layout: "fullscreen", design: figma("142:9913") },
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

/* ---------- Floating MDM shell: mirrors the Figma "App Shell" frame ---------- */

const mdmNav: AppShellNavSection[] = [
  {
    label: "Master Data",
    items: [
      { label: "Dashboard", href: "#dashboard", icon: <LayoutGrid /> },
      { label: "Stores", href: "#stores", icon: <Home /> },
      { label: "Products", href: "#products", icon: <File /> },
      { label: "Inventory", href: "#inventory", icon: <List />, badge: 4, badgeTone: "danger" },
      {
        label: "Vendors",
        icon: <Users />,
        items: [
          { label: "All vendors", href: "#vendors" },
          { label: "Invite vendor", href: "#vendors/invite" },
          { label: "Applications", href: "#vendors/applications" },
          { label: "Submissions", href: "#vendors/submissions" },
        ],
      },
      { label: "Search", href: "#search", icon: <Search /> },
    ],
  },
];

function OrgBrand({ compact }: { compact?: boolean }) {
  return (
    <>
      <span className="grid size-9 flex-none place-items-center rounded-control bg-accent-default text-fg-on-accent"><Home size={18} aria-hidden="true" /></span>
      {!compact && (
        <span className="grid min-w-0 leading-tight">
          <span className="type-label truncate">Texas Operations</span>
          <span className="type-caption text-fg-muted">10 stores</span>
        </span>
      )}
    </>
  );
}

function Promo() {
  return (
    <div className="grid gap-2 rounded-control bg-accent-default p-3 text-fg-on-accent">
      <p className="type-label">3 applications to review</p>
      <p className="type-caption text-on-accent-muted">Vendors have been waiting since Monday.</p>
      <Button size="sm" variant="secondary" className="w-full">Review now</Button>
    </div>
  );
}

function Profile() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="MDM Admin" status="online" />
      <span className="grid min-w-0 flex-1">
        <span className="type-label truncate">MDM Admin</span>
        <span className="type-caption truncate text-fg-muted">admin@convenience-store.com</span>
      </span>
      <Button size="icon" variant="ghost" aria-label="Settings" className="size-8"><Settings size={16} /></Button>
    </div>
  );
}

const reviews = [
  ["Lone Star Beverages", "danger", "High", "Priya", "Mon"],
  ["Gulf Coast Snacks", "warning", "Medium", "Dev", "Tue"],
  ["Hill Country Dairy", "warning", "Medium", "Maya", "Tue"],
  ["Bayou Ice Co.", "info", "Low", "Leo", "Wed"],
] as const;

function HeaderSearch() {
  const [query, setQuery] = useState("");
  return <SearchField label="Search vendors" hideLabel placeholder="Search vendors" value={query} onValueChange={setQuery} className="hidden w-[280px] md:grid" />;
}

function ApplicationsPage() {
  return (
    <div className="grid gap-6 px-4 pb-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Waiting for review" value={12} change="+3" context="New this week" />
        <MetricCard label="Approved this month" value={48} change="+9" context="Compared with September" />
        <MetricCard label="Average review time" value={2.4} decimals={1} suffix={"\u00a0d"} change="+0.4 d" changeTone="negative" context="Slower than last month" />
      </div>
      <section className="overflow-hidden rounded-container border border-border-default bg-bg-surface">
        <header className="flex items-center gap-3 border-b border-border-default p-4">
          <h2 className="type-title flex-1">Awaiting review</h2>
          <span className="type-caption text-fg-muted">Oldest first</span>
        </header>
        <ul>
          {reviews.map(([vendor, tone, priority, owner, day]) => (
            <li key={vendor} className="flex items-center gap-3 border-b border-border-subtle py-1.5 pr-4 pl-2 last:border-b-0">
              <Checkbox aria-label={`Select ${vendor}`} />
              <span className="type-label min-w-0 flex-1 truncate">{vendor}</span>
              <Badge size="sm" tone={tone}>{priority}</Badge>
              <span className="type-body-sm w-18 text-fg-muted">{owner}</span>
              <span className="type-body-sm w-12 text-right text-fg-muted">{day}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** The floating layout from Figma: sidebar inset 12px, accent pill for the current page, a Vendors group, a promo card. */
export const FloatingMDM: Story = {
  name: "Floating · MDM admin",
  parameters: { design: figma("142:9913") },
  args: {
    variant: "inset",
    nav: mdmNav,
    currentHref: "#vendors/applications",
    brand: <OrgBrand />,
    brandMark: <OrgBrand compact />,
    sidebarFooter: <div className="grid gap-3"><Promo /><Profile /></div>,
    sidebarFooterRail: <Avatar name="MDM Admin" status="online" />,
    header: (
      <div className="grid">
        <h1 className="type-h2 truncate">Applications</h1>
        <p className="type-body-sm truncate text-fg-muted">Vendor onboarding · 12 waiting for review</p>
      </div>
    ),
    actions: (
      <>
        <HeaderSearch />
        <Button leadingIcon={<Plus />}>Invite vendor</Button>
      </>
    ),
    children: <ApplicationsPage />,
  },
};

export const FloatingMDMRail: Story = {
  name: "Floating · MDM admin, rail",
  parameters: FloatingMDM.parameters,
  args: { ...FloatingMDM.args, defaultCollapsed: true },
};
