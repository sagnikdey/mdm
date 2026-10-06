"use client";

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { BarChart3, Building2, FileText, Handshake, LayoutDashboard, Search, Settings, Target } from "lucide-react";
import { AppShell, Badge, Breadcrumb, Button, CommandPalette, Dialog, DialogContent, MetricCard, NotificationCenter, UserMenu, type AppShellNavSection } from "@sagui/ui";

const face = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&q=80&auto=format&fit=crop&crop=faces`;

const nav: AppShellNavSection[] = [
  {
    items: [
      { label: "Overview", href: "/app", icon: <LayoutDashboard /> },
      { label: "Pipeline", href: "/app/pipeline", icon: <Target /> },
      { label: "Deals", href: "/app/deals", icon: <Handshake />, badge: 12 },
      { label: "Accounts", href: "/app/accounts", icon: <Building2 /> },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/app/reports", icon: <BarChart3 /> },
      { label: "Forecasts", href: "/app/forecasts", icon: <FileText />, badge: <Badge size="sm" tone="info">New</Badge> },
    ],
  },
  { label: "Workspace", items: [{ label: "Settings", href: "/app/settings", icon: <Settings /> }] },
];
const titles: Record<string, string> = Object.fromEntries(nav.flatMap((section) => section.items).map((item) => [item.href, item.label]));

const commands = [
  ...nav.flatMap((section) => section.items).map((item) => ({ id: item.href, label: `Go to ${item.label}`, group: "Navigate", icon: item.icon })),
  { id: "new-deal", label: "Create deal", group: "Actions", shortcut: "N" },
  { id: "export", label: "Export report", group: "Actions" },
];

const notifications = [
  { id: "n1", title: "Maya Chen closed Acme", description: "$42,000, two weeks ahead of forecast.", time: "8m", tone: "success" as const, actor: { name: "Maya Chen", photo: face("photo-1494790108377-be9c29b29330") } },
  { id: "n2", title: "Globex is waiting on legal", description: "Contract review has been open for 6 days.", time: "1h", tone: "warning" as const },
  { id: "n3", title: "Q3 forecast is ready", time: "Yesterday", read: true },
];

// #region Hero
export function Hero() {
  const [current, setCurrent] = useState("/app");
  const [searching, setSearching] = useState(false);

  // In a real app the links navigate; in this preview a click only moves the current page.
  function stayHere(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/app"]');
    if (!link) return;
    event.preventDefault();
    setCurrent(link.getAttribute("href")!);
  }

  // Cmd/Ctrl + K opens search from anywhere in the app.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearching(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div onClickCapture={stayHere} className="h-[560px] w-full overflow-y-auto rounded-[var(--radius-lg)] border border-border" style={{ "--app-shell-height": "558px" } as CSSProperties}>
      <AppShell
        nav={nav}
        currentHref={current}
        brand={<span className="flex items-center gap-2 font-semibold"><span className="grid size-7 place-items-center rounded-control bg-primary text-xs text-primary-foreground">S</span>Sales</span>}
        brandMark={<span className="grid size-7 place-items-center rounded-control bg-primary text-xs font-semibold text-primary-foreground">S</span>}
        header={<Breadcrumb items={[{ label: "Acme Inc.", href: "/app" }, { label: titles[current] }]} />}
        actions={
          <>
            <Button variant="ghost" size="sm" leadingIcon={<Search />} onClick={() => setSearching(true)}>
              <span className="hidden sm:inline">Search</span>
            </Button>
            <NotificationCenter notifications={notifications} />
            <UserMenu user={{ name: "Sagnik Dey", email: "sagnik@example.com", plan: "Pro", avatarSrc: face("photo-1507003211169-0a1dd7228f2d") }} items={[{ label: "Profile" }, { label: "Settings", icon: <Settings />, keys: ["⌘", ","] }]} onSignOut={() => {}} />
          </>
        }
      >
        <div className="grid gap-6 p-6">
          <h1 className="type-h2">{titles[current]}</h1>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Revenue" value={128.4} prefix="$" suffix="k" decimals={1} change="+12.4%" context="vs last month" />
            <MetricCard label="Deals won" value={42} change="+6" context="vs last month" />
            <MetricCard label="Win rate" value={31.5} suffix="%" decimals={1} change="+2.1 pts" context="vs last month" />
          </div>
          <p className="type-body-sm text-muted-foreground">Press ⌘B to fold the sidebar into a rail, and ⌘K to search. Narrow the window to see the drawer.</p>
        </div>
      </AppShell>

      <Dialog open={searching} onOpenChange={setSearching}>
        <DialogContent title="Search" className="p-0">
          <CommandPalette
            items={commands}
            autoFocus
            placeholder="Search pages and actions"
            onSelect={(item) => {
              if (item.id.startsWith("/app")) setCurrent(item.id);
              setSearching(false);
            }}
            onClose={() => setSearching(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
// #endregion

// #region StartFolded
export function StartFolded() {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border" style={{ "--app-shell-height": "358px" } as CSSProperties}>
      <AppShell nav={nav} currentHref="/app/deals" defaultCollapsed brand={<span className="font-semibold">Sales</span>} brandMark={<span className="font-semibold">S</span>} header={<span className="type-title">Deals</span>}>
        <p className="p-6 text-sm text-muted-foreground">Point at an icon to see its label.</p>
      </AppShell>
    </div>
  );
}
// #endregion
