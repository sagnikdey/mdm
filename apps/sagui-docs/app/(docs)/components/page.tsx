import Link from "next/link";
import type { Metadata } from "next";
import { componentsByCategory } from "../../../lib/content";

export const metadata: Metadata = { title: "Components", description: "Every SagUI component." };

export default function ComponentsIndex() {
  return (
    <main className="min-w-0 flex-1 py-10 lg:py-12">
      <h1 className="mb-3 text-4xl font-semibold tracking-tight">Components</h1>
      <p className="mb-10 max-w-2xl text-lg text-muted-foreground">Accessible React components with motion built in. Each page has a live preview, the API, keyboard and screen reader behavior, and how it moves.</p>
      {componentsByCategory().map((group) => (
        <section key={group.id} className="mb-12" aria-labelledby={group.id}>
          <h2 id={group.id} className="text-xl font-semibold tracking-tight">{group.title}</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">{group.blurb}</p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((doc) => (
              <li key={doc.slug}>
                <Link href={`/components/${doc.slug}`} className="block h-full rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="block font-medium">{doc.title}</span>
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">{doc.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
