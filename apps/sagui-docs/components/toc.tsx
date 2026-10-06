"use client";

import * as React from "react";

/** "On this page": highlights the section nearest the top as you scroll. */
export function Toc({ items, markdownHref }: { items: { id: string; title: string }[]; markdownHref?: string }) {
  const [active, setActive] = React.useState(items[0]?.id);
  React.useEffect(() => {
    const nodes = items.map((item) => document.getElementById(item.id)).filter((node): node is HTMLElement => !!node);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);
  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 flex-none overflow-y-auto py-8 pl-4 xl:block">
      <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">On this page</h2>
      <ul className="grid gap-1 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className="-ml-px block border-l border-transparent py-1 pl-3 text-[13px] text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:border-foreground aria-[current=location]:text-foreground"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-1.5 border-t border-border pt-4 text-[13px]">
        {markdownHref && <a href={markdownHref} className="text-muted-foreground transition-colors hover:text-foreground">View as Markdown</a>}
        <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">Back to top</a>
      </div>
    </nav>
  );
}
