import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { Tooltip } from "../tooltip/tooltip";

export interface AppShellNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  /** Trailing content such as a count or a Badge. Hidden while the sidebar is a rail. */
  badge?: React.ReactNode;
  /** Marks the item as the current page. Without it, `currentHref` decides. */
  current?: boolean;
}
export interface AppShellNavSection {
  /** Small heading above the section. Hidden while the sidebar is a rail. */
  label?: string;
  items: AppShellNavItem[];
}
export interface AppShellProps {
  /** Navigation, in sections. */
  nav: AppShellNavSection[];
  /** Logo and product name at the top of the sidebar. */
  brand?: React.ReactNode;
  /** A compact mark shown instead of `brand` while the sidebar is a rail. */
  brandMark?: React.ReactNode;
  /** Pinned to the bottom of the sidebar, for example settings or a workspace switcher. */
  sidebarFooter?: React.ReactNode;
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
  children: React.ReactNode;
  className?: string;
}

const EXPANDED = 248;
const RAIL = 68;

/** The longest href that the current path starts with wins, so /deals/42 marks Deals rather than Overview. */
function currentItem(nav: AppShellNavSection[], currentHref?: string) {
  const items = nav.flatMap((section) => section.items);
  const explicit = items.find((item) => item.current);
  if (explicit || !currentHref) return explicit?.href;
  const matches = items.filter((item) => currentHref === item.href || (item.href !== "/" && currentHref.startsWith(item.href.replace(/\/$/, "") + "/")));
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function NavList({ nav, current, rail, Link, label, layoutId, onNavigate }: {
  nav: AppShellNavSection[];
  current?: string;
  rail: boolean;
  Link: React.ElementType;
  label: string;
  layoutId: string;
  onNavigate?: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <nav aria-label={label} className="grid gap-5">
      {nav.map((section, sectionIndex) => (
        <div key={section.label ?? sectionIndex} className="grid gap-0.5">
          {section.label && (
            <p className={cn("type-overline truncate px-3 pb-1 text-muted-foreground transition-opacity duration-[var(--duration-fast)]", rail && "pointer-events-none opacity-0")} aria-hidden={rail || undefined}>
              {section.label}
            </p>
          )}
          <ul className="grid gap-0.5">
            {section.items.map((item) => {
              const active = item.href === current;
              const link = (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "group/item relative isolate flex h-9 items-center gap-3 rounded-control px-3 text-sm text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-out-quint [-webkit-tap-highlight-color:transparent]",
                    "[@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={layoutId}
                      className="absolute inset-0 -z-10 rounded-[inherit] bg-muted"
                      transition={reduced ? { duration: 0 } : (spring.morph as never)}
                      aria-hidden="true"
                    />
                  )}
                  {/* Hover tint for items that are not current; the current item keeps the gliding highlight. */}
                  {!active && <span className="absolute inset-0 -z-10 rounded-[inherit] bg-muted opacity-0 transition-opacity duration-[var(--duration-fast)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/item:opacity-60" aria-hidden="true" />}
                  {item.icon && <span className="grid size-5 flex-none place-items-center [&_svg]:size-[18px]" aria-hidden="true">{item.icon}</span>}
                  <span className={cn("min-w-0 flex-1 truncate transition-opacity duration-[var(--duration-fast)]", rail && "sr-only")}>{item.label}</span>
                  {item.badge && !rail && <span className="flex-none text-xs tabular-nums text-muted-foreground">{item.badge}</span>}
                </Link>
              );
              return (
                <li key={item.href}>
                  {rail ? <Tooltip content={item.label} side="right">{link}</Tooltip> : link}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * The frame of an application: a sticky sidebar of navigation beside a scrolling main column with a top bar.
 * On wide screens the sidebar folds into an icon rail (the toggle, or Cmd/Ctrl + B); below 1024px it becomes a drawer.
 */
export function AppShell({
  nav,
  brand,
  brandMark,
  sidebarFooter,
  header,
  actions,
  currentHref,
  linkComponent: Link = "a",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  label = "Main",
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

  return (
    <div className={cn("grid min-h-[var(--app-shell-height,100dvh)] bg-background text-foreground lg:grid-cols-[auto_minmax(0,1fr)]", className)}>
      <a
        href={`#${mainId}`}
        className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-sm font-medium shadow-floating focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      {/* Wide screens: the sidebar keeps its column and folds to a rail on a spring, so the main column reflows smoothly. */}
      <motion.aside
        id={sidebarId}
        className="sticky top-0 hidden h-[var(--app-shell-height,100dvh)] flex-col overflow-hidden border-r border-border bg-background lg:flex"
        initial={false}
        animate={{ width: collapsed ? RAIL : EXPANDED }}
        transition={reduced ? { duration: 0 } : (spring.smooth as never)}
        data-collapsed={collapsed || undefined}
      >
        <div className={cn("flex h-14 flex-none items-center gap-2 px-4", collapsed && "justify-center px-0")}>
          {collapsed ? brandMark ?? brand : brand}
        </div>
        <LayoutGroup id={`${id}-wide`}>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:thin]">
            <NavList nav={nav} current={current} rail={collapsed} Link={Link} label={label} layoutId="current" />
          </div>
        </LayoutGroup>
        <div className={cn("grid flex-none gap-2 border-t border-border p-3", collapsed && "justify-items-center")}>
          {sidebarFooter && <div className={cn(collapsed && "hidden")}>{sidebarFooter}</div>}
          <Tooltip content={`${toggleLabel} (⌘B)`} side="right">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={toggleLabel}
              aria-controls={sidebarId}
              aria-expanded={!collapsed}
              className="grid size-9 cursor-pointer place-items-center rounded-control text-muted-foreground transition-colors duration-[var(--duration-fast)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ToggleIcon size={18} aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 flex-none items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="-ml-1.5 grid size-9 flex-none cursor-pointer place-items-center rounded-control text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
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
              <NavList nav={nav} current={current} rail={false} Link={Link} label={label} layoutId="current" onNavigate={() => setMobileOpen(false)} />
            </LayoutGroup>
            {sidebarFooter && <div className="border-t border-border pt-4">{sidebarFooter}</div>}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
