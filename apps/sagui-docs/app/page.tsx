import Link from "next/link";
import { Button } from "@sagui/ui";
import { componentsByCategory } from "../lib/content";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">React components with motion built in.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">SagUI is a set of accessible components on a shared token layer. Labels morph in place, widths follow content on springs, and reduced motion is respected everywhere.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild><Link href="/docs/installation">Get started</Link></Button>
        <Button asChild variant="outline"><Link href="/components">Browse components</Link></Button>
      </div>
      <div className="mt-20 grid gap-10">
        {componentsByCategory().map((group) => (
          <section key={group.id} aria-labelledby={`home-${group.id}`}>
            <h2 id={`home-${group.id}`} className="text-xl font-semibold tracking-tight">{group.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((doc) => (
                <li key={doc.slug}>
                  <Link href={`/components/${doc.slug}`} className="inline-block rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{doc.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
