import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { Badge, type BadgeTone } from "../badge/badge";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { Tooltip } from "../tooltip/tooltip";

export interface AppShellNavItem {
  label: string;
  /** Destination. Optional for a group, which links to its first page while the sidebar is a rail. */
  href?: string;
  icon?: React.ReactNode;
  /**
   * Trailing count or content. A number or short string renders as a small Badge, which shrinks to a dot while the
   * sidebar is a rail; any other node renders as given and is hidden on the rail.
   */
  badge?: React.ReactNode;
  /** Tone of a number or string badge. Use danger for work that needs attention. */
  badgeTone?: BadgeTone;
  /** Marks the item as the current page. Without it, `currentHref` decides. */
  current?: boolean;
  /** Pages inside a collapsible group. A group opens by default when it holds the current page. One level only. */
  items?: AppShellNavItem[];
  /** Whether the group starts open. Defaults to open when it holds the current page. */
  defaultOpen?: boolean;
}
export interface AppShellNavSection {
  /** Small heading above the section. Hidden while the sidebar is a rail. */
  label?: string;
  items: AppShellNavItem[];
}
export type AppShellVariant = "sidebar" | "inset";

export interface AppShellProps {
  /** Navigation, in sections. */
  nav: AppShellNavSection[];
  /** Logo and product name at the top of the sidebar. */
  brand?: React.ReactNode;
  /** A compact mark shown instead of `brand` while the sidebar is a rail. */
  brandMark?: React.ReactNode;
  /** Pinned to the bottom of the sidebar, for example settings or a workspace switcher. */
  sidebarFooter?: React.ReactNode;
  /** Compact footer for the rail, such as the user's avatar alone. Without it the footer hides on the rail. */
  sidebarFooterRail?: React.ReactNode;
  /** Start of the top bar: the page title or a Breadcrumb. */
  header?: React.ReactNode;
  /** End of the top bar: search, notifications, the user menu. */
  actions?: React.ReactNode;
  /** The current path. An item is current when its href matches it exactly, or is its closest parent. */
  currentHref?: string;
  /** Element for nav links. Pass your router's Link, such as next/link. Defaults to `a`. */
  linkComponent?: React.ElementType;
  /** Controlled rail state on wide screens. */
  collapsed?: boolean;
  /** Rail state on first render when uncontrolled. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible name of the navigation landmark. */
  label?: string;
  /**
   * "sidebar" sits flush against the edge with a dividing border. "inset" floats the sidebar as a rounded panel
   * 12px in from the edges, marks the current page with an accent pill, keeps the collapse toggle in the sidebar
   * header and drops the top bar's border.
   */
  variant?: AppShellVariant;
  children: React.ReactNode;
  className?: string;
}

const EXPANDED = 272;
const RAIL = 76;
/** Gap around the inset sidebar panel, on its outer edges. */
const INSET_GAP = 12;

/** Every page in the nav, with group pages flattened in. */
const pagesOf = (nav: AppShellNavSection[]) =>
  nav.flatMap((section) => section.items.flatMap((item) => (item.items?.length ? item.items : [item]))).filter((item) => item.href);

/** The longest href that the current path starts with wins, so /deals/42 marks Deals rather than Overview. */
function currentItem(nav: AppShellNavSection[], currentHref?: string) {
  const items = pagesOf(nav);
  const explicit = items.find((item) => item.current);
  if (explicit || !currentHref) return explicit?.href;
  const matches = items.filter((item) => currentHref === item.href || (item.href !== "/" && currentHref.startsWith(item.href!.replace(/\/$/, "") + "/")));
  return matches.sort((a, b) => b.href!.length - a.href!.length)[0]?.href;
}

const dotTone: Record<BadgeTone, string> = {
  neutral: "bg-fg-muted",
  success: "bg-success-default",
  info: "bg-accent-default",
  warning: "bg-warning-default",
  danger: "bg-danger-default",
};

/** A count or short label becomes a Badge, and a dot on the rail; anything else renders as given. */
function ItemBadge({ item, rail }: { item: AppShellNavItem; rail: boolean }) {
  if (item.badge == null || item.badge === false) return null;
  const simple = typeof item.badge === "number" || typeof item.badge === "string";
  if (rail) {
    return simple ? <span className={cn("absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-bg-surface", dotTone[item.badgeTone ?? "neutral"])} aria-hidden="true" /> : null;
  }
  return simple ? <Badge size="sm" tone={item.badgeTone ?? "neutral"} className="flex-none tabular-nums">{item.badge}</Badge> : <span className="flex-none">{item.badge}</span>;
}

function NavList({ nav, current, rail, Link, label, layoutId, onNavigate, accent }: {
  nav: AppShellNavSection[];
  current?: string;
  rail: boolean;
  Link: React.ElementType;
  label: string;
  layoutId: string;
  onNavigate?: () => void;
  /** Mark the current page with the accent pill (inset) instead of a muted highlight. */
  accent?: boolean;
}) {
  const reduced = useReducedMotion();
  const highlight = (active: boolean) =>
    active ? (
      <motion.span
        layoutId={layoutId}
        className={cn("absolute inset-0 -z-10 rounded-[inherit]", accent ? "bg-accent-default shadow-raised" : "bg-bg-muted")}
        transition={reduced ? { duration: 0 } : (spring.morph as never)}
        aria-hidden="true"
      />
    ) : (
      /* Hover tint for items that are not current; the current item keeps the gliding highlight. */
      <span className="absolute inset-0 -z-10 rounded-[inherit] bg-bg-muted opacity-0 transition-opacity duration-[var(--duration-fast)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/item:opacity-60" aria-hidden="true" />
    );
  const itemClass = cn(
    "group/item relative isolate flex items-center gap-3 rounded-control px-3 text-sm text-fg-muted outline-none transition-colors duration-[var(--duration-fast)] ease-out-quint [-webkit-tap-highlight-color:transparent]",
    "[@media(hover:hover)_and_(pointer:fine)]:hover:text-fg-default focus-visible:ring-2 focus-visible:ring-border-focus aria-[current=page]:font-medium",
    accent ? "h-10 font-medium aria-[current=page]:text-fg-on-accent" : "h-9 aria-[current=page]:text-fg-default",
    rail && "justify-center px-0"
  );
  const iconOf = (item: AppShellNavItem) =>
    item.icon && <span className="grid size-5 flex-none place-items-center [&_svg]:size-[18px]" aria-hidden="true">{item.icon}</span>;

  const pageLink = (item: AppShellNavItem, active: boolean, extra?: React.ReactNode) => {
    const link = (
      <Link href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate} className={itemClass}>
        {highlight(active)}
        {iconOf(item)}
        <span className={cn("min-w-0 flex-1 truncate", rail && "sr-only")}>{item.label}</span>
        <ItemBadge item={item} rail={rail} />
        {extra}
      </Link>
    );
    return rail ? <Tooltip content={item.label} side="right">{link}</Tooltip> : link;
  };

  return (
    <nav aria-label={label} className="grid gap-5">
      {nav.map((section, sectionIndex) => (
        <div key={section.label ?? sectionIndex} className="grid gap-0.5">
          {section.label && (
            <p className={cn("type-overline truncate px-3 pb-1 text-fg-muted transition-opacity duration-[var(--duration-fast)]", rail && "pointer-events-none h-0 overflow-hidden pb-0 opacity-0")} aria-hidden={rail || undefined}>
              {section.label}
            </p>
          )}
          <ul className={cn("grid", accent ? "gap-1" : "gap-0.5")}>
            {section.items.map((item) => {
              const pages = item.items?.filter((page) => page.href) ?? [];
              if (!pages.length) return <li key={item.href ?? item.label}>{pageLink(item, item.href === current)}</li>;
              const holdsCurrent = pages.some((page) => page.href === current);
              // On the rail a group is one icon that opens its first page and lights up when it holds the current page.
              if (rail) return <li key={item.label}>{pageLink({ ...item, href: item.href ?? pages[0].href }, holdsCurrent)}</li>;
              return <NavGroup key={item.label} item={item} pages={pages} current={current} holdsCurrent={holdsCurrent} accent={accent} renderPage={pageLink} iconOf={iconOf} />;
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavGroup({ item, pages, current, holdsCurrent, accent, renderPage, iconOf }: {
  item: AppShellNavItem;
  pages: AppShellNavItem[];
  current?: string;
  holdsCurrent: boolean;
  accent?: boolean;
  renderPage: (item: AppShellNavItem, active: boolean) => React.ReactNode;
  iconOf: (item: AppShellNavItem) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(item.defaultOpen ?? holdsCurrent);
  const listId = React.useId();
  // Opening a page inside the group from elsewhere opens the group.
  React.useEffect(() => { if (holdsCurrent) setOpen(true); }, [holdsCurrent]);
  return (
    <li className="grid gap-0.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "group/item relative isolate flex w-full cursor-pointer items-center gap-3 rounded-control px-3 text-left text-sm text-fg-muted outline-none transition-colors duration-[var(--duration-fast)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-fg-default focus-visible:ring-2 focus-visible:ring-border-focus",
          accent ? "h-10 font-medium" : "h-9",
          holdsCurrent && "text-accent-default [@media(hover:hover)_and_(pointer:fine)]:hover:text-accent-default"
        )}
      >
        <span className="absolute inset-0 -z-10 rounded-[inherit] bg-bg-muted opacity-0 transition-opacity duration-[var(--duration-fast)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/item:opacity-60" aria-hidden="true" />
        {iconOf(item)}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ItemBadge item={item} rail={false} />
        <ChevronRight size={16} aria-hidden="true" className={cn("flex-none transition-transform duration-[var(--duration-standard)] ease-out-quint motion-reduce:transition-none", open && "rotate-90")} />
      </button>
      <ul id={listId} hidden={!open} className="ml-5 grid gap-0.5 border-l border-border-default pl-3">
        {pages.map((page) => {
          const active = page.href === current;
          return (
            <li key={page.href}>
              {/* Pages inside a group are lighter: a dot and the label, accent when current. */}
              <SubLink page={page} active={active} render={renderPage} />
            </li>
          );
        })}
      </ul>
    </li>
  );
}

/** A page inside a group, drawn with a leading dot. Reuses the item renderer so links, badges and tooltips stay consistent. */
function SubLink({ page, active, render }: { page: AppShellNavItem; active: boolean; render: (item: AppShellNavItem, active: boolean) => React.ReactNode }) {
  return (
    <div className="[&_a]:h-8 [&_a]:gap-2.5 [&_a]:font-normal [&_a[aria-current=page]]:font-medium [&_a[aria-current=page]]:text-accent-default [&_a[aria-current=page]>span:first-child]:hidden">
      {render({ ...page, icon: <span className={cn("block size-1.5 rounded-full", active ? "bg-accent-default" : "bg-border-strong")} /> }, active)}
    </div>
  );
}

/**
 * The frame of an application: a sticky sidebar of navigation beside a scrolling main column with a top bar.
 * On wide screens the sidebar folds into an icon rail (the toggle, or Cmd/Ctrl + B); below 1024px it becomes a drawer.
 * The `inset` variant floats the sidebar as a rounded panel with an accent pill for the current page and the toggle in its header.
 */
export function AppShell({
  nav,
  brand,
  brandMark,
  sidebarFooter,
  sidebarFooterRail,
  header,
  actions,
  currentHref,
  linkComponent: Link = "a",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  label = "Main",
  variant = "sidebar",
  children,
  className,
}: AppShellProps) {
  const reduced = useReducedMotion();
  const [own, setOwn] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? own;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const id = React.useId();
  const sidebarId = `${id}-sidebar`;
  const mainId = `${id}-main`;
  const current = currentItem(nav, currentHref);

  const setCollapsed = React.useCallback((next: boolean) => {
    if (collapsedProp === undefined) setOwn(next);
    onCollapsedChange?.(next);
  }, [collapsedProp, onCollapsedChange]);

  // Cmd/Ctrl + B folds the sidebar, unless someone is typing.
  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "b" || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
      event.preventDefault();
      setCollapsed(!collapsed);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsed, setCollapsed]);

  // A route change on a phone closes the drawer.
  React.useEffect(() => setMobileOpen(false), [currentHref]);

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const inset = variant === "inset";
  const railWidth = collapsed ? RAIL : EXPANDED;

  const toggle = (
    <Tooltip content={`${toggleLabel} (⌘B)`} side={inset ? "bottom" : "right"}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={toggleLabel}
        aria-controls={sidebarId}
        aria-expanded={!collapsed}
        className={cn(
          "grid size-9 cursor-pointer place-items-center rounded-control text-fg-muted transition-colors duration-[var(--duration-fast)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
          inset && "size-8 flex-none"
        )}
      >
        <ToggleIcon size={18} aria-hidden="true" />
      </button>
    </Tooltip>
  );

  return (
    <div className={cn("grid min-h-[var(--app-shell-height,100dvh)] text-fg-default lg:grid-cols-[auto_minmax(0,1fr)]", inset ? "bg-bg-muted" : "bg-bg-canvas", className)}>
      <a
        href={`#${mainId}`}
        className="sr-only z-50 rounded-control bg-bg-surface px-3 py-2 text-sm font-medium shadow-floating focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-none focus:ring-2 focus:ring-border-focus"
      >
        Skip to content
      </a>

      {/* Wide screens: the sidebar keeps its column and folds to a rail on a spring, so the main column reflows smoothly. */}
      <motion.aside
        id={sidebarId}
        className={cn(
          "sticky top-0 hidden h-[var(--app-shell-height,100dvh)] overflow-hidden lg:flex",
          inset ? "py-3 pl-3" : "flex-col border-r border-border-default bg-bg-canvas"
        )}
        initial={false}
        animate={{ width: inset ? railWidth + INSET_GAP : railWidth }}
        transition={reduced ? { duration: 0 } : (spring.smooth as never)}
        data-collapsed={collapsed || undefined}
        data-variant={variant}
      >
        <div className={cn("flex min-w-0 flex-1 flex-col", inset && "overflow-hidden rounded-container border border-border-default bg-bg-surface shadow-raised")}>
        {inset ? (
          /* Inset: the org header carries the toggle; on the rail the mark and toggle stack. */
          <div className={cn("flex flex-none items-center gap-3 border-b border-border-default p-3", collapsed && "flex-col")}>
            <div className={cn("flex min-w-0 items-center gap-2", !collapsed && "flex-1")}>{collapsed ? brandMark ?? brand : brand}</div>
            {toggle}
          </div>
        ) : (
          <div className={cn("flex h-14 flex-none items-center gap-2 px-4", collapsed && "justify-center px-0")}>
            {collapsed ? brandMark ?? brand : brand}
          </div>
        )}
        <LayoutGroup id={`${id}-wide`}>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:thin]">
            <NavList nav={nav} current={current} rail={collapsed} Link={Link} label={label} layoutId="current" accent={inset} />
          </div>
        </LayoutGroup>
        {/* The inset variant keeps the toggle in the top bar, so its footer only exists when there is footer content. */}
        {(!inset || sidebarFooter || sidebarFooterRail) && (
          <div className={cn("grid flex-none gap-2 border-t border-border-default p-3", collapsed && "justify-items-center")}>
            {collapsed ? sidebarFooterRail : sidebarFooter}
            {!inset && toggle}
          </div>
        )}
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-col">
        <header className={cn("sticky top-0 z-30 flex h-14 flex-none items-center gap-3 px-4 backdrop-blur sm:px-6", inset ? "bg-bg-muted/85" : "border-b border-border-default bg-bg-canvas/85")}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="-ml-1.5 grid size-9 flex-none cursor-pointer place-items-center rounded-control text-fg-muted transition-colors duration-[var(--duration-fast)] hover:bg-bg-muted hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus lg:hidden"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">{header}</div>
          {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
        </header>
        <main id={mainId} tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </main>
      </div>

      {/* Phones and tablets: the same navigation in a drawer from the start edge. */}
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerContent side="left" title={typeof label === "string" ? `${label} navigation` : "Navigation"} className="lg:hidden">
          <div className="grid gap-4">
            {brand && <div className="flex items-center gap-2">{brand}</div>}
            <LayoutGroup id={`${id}-narrow`}>
              <NavList nav={nav} current={current} rail={false} Link={Link} label={label} layoutId="current" accent={inset} onNavigate={() => setMobileOpen(false)} />
            </LayoutGroup>
            {sidebarFooter && <div className="border-t border-border-default pt-4">{sidebarFooter}</div>}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
