---
title: App shell
slug: app-shell
description: "The frame of an application: a sidebar of navigation that folds into a rail, and a top bar for the page title, search and account."
category: navigation
component: AppShell
keywords:
  - app shell
  - sidebar
  - layout
  - navigation
  - dashboard layout
  - collapsible sidebar
  - top bar
---

The frame of an application: a sidebar of navigation that folds into a rail, and a top bar for the page title, search and account.

<!-- demo: Hero -->

## When to use

- The outer layout of a product: a dashboard, an admin tool, a workspace with several sections.
- Apps with five to fifteen destinations that people move between all day.
- Screens that need the most width on demand, where the sidebar can fold into an icon rail.

## When not to use

- Marketing sites and docs. They need a site header, not a sidebar.
- Two or three destinations. Use [tabs](/components/tabs) in the page instead.
- Moving between views of one dataset. That is [tabs](/components/tabs) or a [segmented control](/components/segmented-control), not navigation.

## Installation

Install the package and import the styles once. The [installation guide](/docs/installation) covers the Tailwind setup.

```bash
npm install @sagui/ui
```

## Usage

Render it once in the layout that wraps your app's pages, and pass it the current path so the right item is marked.

```tsx title="app/(app)/layout.tsx"
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, LayoutDashboard, Settings } from "lucide-react";
import { AppShell } from "@sagui/ui";

const nav = [
  { items: [
    { label: "Overview", href: "/", icon: <LayoutDashboard /> },
    { label: "Deals", href: "/deals", icon: <Handshake />, badge: 12 },
  ] },
  { label: "Workspace", items: [{ label: "Settings", href: "/settings", icon: <Settings /> }] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={nav} currentHref={usePathname()} linkComponent={Link} brand={<span className="font-semibold">Sales</span>}>
      {children}
    </AppShell>
  );
}
```

The shell gives you the frame; you fill its slots. Put the page title or a [breadcrumb](/components/breadcrumb) in `header`. Put search, [notifications](/components/notification-center) and the [user menu](/components/user-menu) in `actions`. Open a [command palette](/components/command-palette) in a dialog for search.

## Examples

### Starting as a rail

`defaultCollapsed` starts with the icon rail. Each icon names itself in a tooltip on hover or focus.

<!-- demo: StartFolded -->

### Remembering the choice

The shell does not store whether the sidebar is folded. Control it with `collapsed` and `onCollapsedChange`, and save the choice where it suits your app, for example a cookie, so the server renders the right width on the next visit.

```tsx
const [collapsed, setCollapsed] = useState(initialFromCookie);

<AppShell nav={nav} collapsed={collapsed} onCollapsedChange={(next) => { setCollapsed(next); document.cookie = `sidebar=${next ? "rail" : "open"}; path=/; max-age=31536000`; }}>
```

## API reference

### AppShell

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nav` (required) | `{ label?: string; items: { label: string; href: string; icon?: ReactNode; badge?: ReactNode; current?: boolean }[] }[]` | – | Navigation in sections. A section label is a small heading; `badge` is a count or a Badge after the label. |
| `children` (required) | `ReactNode` | – | The page. It renders in the main column under the top bar. |
| `currentHref` | `string` | – | The current path. The item whose href matches it, or is its closest parent, is marked current, so `/deals/42` marks Deals. |
| `linkComponent` | `ElementType` | `"a"` | Element for nav links. Pass your router's Link, such as next/link. It must forward its ref. |
| `brand` | `ReactNode` | – | Logo and product name at the top of the sidebar and the drawer. |
| `brandMark` | `ReactNode` | – | A compact mark shown instead of `brand` while the sidebar is a rail. |
| `header` | `ReactNode` | – | Start of the top bar: the page title or a Breadcrumb. |
| `actions` | `ReactNode` | – | End of the top bar: search, notifications and the user menu. |
| `sidebarFooter` | `ReactNode` | – | Pinned to the bottom of the sidebar above the fold toggle. Hidden while the sidebar is a rail. |
| `collapsed` | `boolean` | – | Controlled rail state on wide screens. |
| `defaultCollapsed` | `boolean` | `false` | Rail state on first render when uncontrolled. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | – | Called when the toggle or Cmd/Ctrl + B folds or opens the sidebar. |
| `label` | `string` | `"Main"` | Accessible name of the navigation landmark. |
| `className` | `string` | – | Class on the outer grid. |

The shell fills the viewport. To place it inside a fixed-height panel, set `--app-shell-height` on an ancestor, for example `style={{ "--app-shell-height": "560px" }}`.

## Keyboard interactions

| Keys | Action |
| --- | --- |
| Tab | The first stop is a "Skip to content" link, then the navigation, the top bar and the page. |
| Cmd + B / Ctrl + B | Folds the sidebar into a rail, or opens it again. Ignored while typing in a field. |
| Enter | Follows the focused link. |
| Escape | Closes the navigation drawer on narrow screens. |

## Accessibility

- The sidebar is a `nav` landmark named by `label`, and the page is a `main` landmark that the skip link jumps to.
- The current item has `aria-current="page"`, so screen readers announce it as the current page.
- In the rail, labels stay in the accessible name of each link, and a tooltip shows them on hover and keyboard focus.
- The fold toggle reports its state with `aria-expanded` and names its action: "Collapse sidebar" or "Expand sidebar".
- The drawer on narrow screens is a modal dialog with a title, so focus stays inside it until it closes.

## Motion

- The sidebar's width springs between full and rail, and the main column reflows on the same spring, so content does not jump.
- The current page's highlight glides from item to item.
- Labels and section headings fade as the rail closes.
- With reduced motion the width and highlight change in one step.

## Responsive behavior

- From 1024px the sidebar is a sticky column beside the page, 248px open or 68px as a rail.
- Below 1024px the sidebar hides and a menu button in the top bar opens the same navigation in a drawer from the start edge. Choosing a page closes the drawer.
- The main column has `min-width: 0`, so wide tables scroll inside it instead of widening the page.

## Performance

- The shell renders the navigation twice, once for the sidebar and once for the drawer, which only mounts while open.
- Folding animates one width; nothing re-renders on scroll.

## Notes

- Render it once in the app's layout so it persists across pages, and pass `currentHref` from the router.
- Keep icons on every item, or on none. A rail with missing icons cannot be read.
- SagUI's App shell is an original component. Arc's own app shell blocks are part of Arc Pro and are not included.

## Related

- [Breadcrumb](/components/breadcrumb): Show where a page sits in a hierarchy.
- [Command palette](/components/command-palette): A keyboard driven search for pages and actions.
- [User menu](/components/user-menu): Account, theme and sign out behind the avatar.
- [Notification center](/components/notification-center): A home for updates with read state.
- [Drawer](/components/drawer): A temporary side surface for focused work.
