"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SearchField } from "@sagui/ui";

export interface NavGroup { title: string; items: { href: string; title: string }[] }

/** Left navigation with a filter. On small screens it opens as a sheet. */
export function Sidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [pathname]);
  const needle = query.trim().toLowerCase();
  const filtered = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !needle || item.title.toLowerCase().includes(needle)) }))
    .filter((group) => group.items.length);

  const nav = (
    <nav aria-label="Documentation" className="grid gap-6">
      <SearchField label="Filter documentation" value={query} onValueChange={setQuery} placeholder="Filter" />
      {filtered.map((group) => (
        <div key={group.title}>
          <h2 className="mb-2 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.title}</h2>
          <ul className="grid gap-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="block rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {!filtered.length && <p className="px-3 text-sm text-muted-foreground">Nothing matches “{query}”.</p>}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 left-4 z-40 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium shadow-floating lg:hidden"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="docs-sheet"
      >
        <Menu size={16} aria-hidden="true" /> Menu
      </button>
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 flex-none overflow-y-auto py-8 pr-4 lg:block">{nav}</aside>
      {open && (
        <div id="docs-sheet" role="dialog" aria-modal="true" aria-label="Documentation menu" className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[min(20rem,90vw)] overflow-y-auto border-r border-border bg-background p-4">
            <button type="button" className="mb-4 ml-auto grid size-9 cursor-pointer place-items-center rounded-full hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={18} aria-hidden="true" />
            </button>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
