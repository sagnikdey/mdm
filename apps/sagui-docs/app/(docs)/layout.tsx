import type { ReactNode } from "react";
import { Sidebar, type NavGroup } from "../../components/sidebar";
import { componentsByCategory, foundations, pages } from "../../lib/content";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const groups: NavGroup[] = [
    { title: "Getting started", items: pages().map((page) => ({ href: `/docs/${page.slug}`, title: page.title })) },
    { title: "Foundations", items: foundations().map((page) => ({ href: `/docs/${page.slug}`, title: page.title })) },
    ...componentsByCategory().map((group) => ({ title: group.title, items: group.items.map((doc) => ({ href: `/components/${doc.slug}`, title: doc.title })) })),
  ];
  return (
    <div className="mx-auto flex max-w-[90rem] gap-6 px-4 sm:px-6">
      <Sidebar groups={groups} />
      {children}
    </div>
  );
}
