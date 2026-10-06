import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Blocks } from "../../../../components/prose";
import { Toc } from "../../../../components/toc";
import { demoSlugFor, foundationSlugs, getPage, pageSlugs, renderBlocks, tocOf } from "../../../../lib/content";

export function generateStaticParams() {
  return [...pageSlugs, ...foundationSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getPage((await params).slug);
  return page ? { title: page.title, description: page.description } : {};
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  const demos = demoSlugFor(slug);
  const blocks = await renderBlocks(page.body, demos);
  return (
    <>
      <main className="min-w-0 flex-1 py-10 lg:py-12">
        <h1 className="mb-3 text-4xl font-semibold tracking-tight">{page.title}</h1>
        <p className="mb-8 text-lg text-muted-foreground">{page.description}</p>
        <Blocks blocks={blocks} slug={demos} />
      </main>
      <Toc items={tocOf(page.body)} />
    </>
  );
}
