import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Blocks } from "../../../../components/prose";
import { Toc } from "../../../../components/toc";
import { PageActions } from "../../../../components/page-actions";
import { bodyWithoutLead, categories, componentMarkdown, getAllComponents, getComponent, renderBlocks, tocOf } from "../../../../lib/content";

export function generateStaticParams() {
  return getAllComponents().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = getComponent((await params).slug);
  return doc ? { title: doc.title, description: doc.description } : {};
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getComponent(slug);
  if (!doc) notFound();
  const body = bodyWithoutLead(doc.body, doc.description);
  const blocks = await renderBlocks(body, slug);
  const all = getAllComponents();
  const index = all.findIndex((item) => item.slug === slug);
  const previous = all[index - 1];
  const next = all[index + 1];
  const category = categories.find((item) => item.id === doc.category);
  // Components already linked under Related are not repeated in "Also in".
  const related = new Set([...(/^## Related\n([\s\S]*?)(?:^## |(?![\s\S]))/m.exec(body)?.[1] ?? "").matchAll(/\]\(\/components\/([a-z-]+)\)/g)].map((match) => match[1]));
  const siblings = all.filter((item) => item.category === doc.category && item.slug !== slug && !related.has(item.slug));
  const markdownHref = `/components/${slug}/markdown`;
  return (
    <>
      <main className="min-w-0 flex-1 py-10 lg:py-12">
        <header className="mb-8">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Components</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li>{category?.title}</li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li aria-current="page" className="text-foreground">{doc.title}</li>
            </ol>
          </nav>
          <h1 className="type-h1">{doc.title}</h1>
          <p className="type-body-lg mt-3 max-w-[60ch] text-muted-foreground">{doc.description}</p>
          <div className="mt-5">
            <PageActions importLine={`import { ${doc.component} } from "@sagui/ui";`} markdown={componentMarkdown(doc)} markdownHref={markdownHref} />
          </div>
        </header>
        <Blocks blocks={blocks} slug={slug} />
        {siblings.length > 0 && (
          <section aria-labelledby="also-in" className="mt-12">
            <div className="prose"><h2 id="also-in">Also in {category?.title.toLowerCase()}</h2></div>
            <ul className="related-grid">
              {siblings.map((item) => (
                <li key={item.slug}>
                  <Link href={`/components/${item.slug}`} className="related-card">
                    <span className="related-title">{item.title}</span>
                    <span className="related-text">{item.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <nav aria-label="Previous and next" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          {previous ? (
            <Link href={`/components/${previous.slug}`} className="group rounded-[var(--radius-lg)] border border-border p-4 transition-colors hover:bg-muted">
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft size={14} aria-hidden="true" /> Previous</span>
              <span className="mt-1 block font-medium">{previous.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/components/${next.slug}`} className="group rounded-[var(--radius-lg)] border border-border p-4 text-right transition-colors hover:bg-muted">
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">Next <ArrowRight size={14} aria-hidden="true" /></span>
              <span className="mt-1 block font-medium">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </main>
      <Toc
        items={[...tocOf(body), ...(siblings.length ? [{ id: "also-in", title: `Also in ${category?.title.toLowerCase()}` }] : [])]}
        markdownHref={markdownHref}
      />
    </>
  );
}
