import { componentMarkdown, getAllComponents, getComponent } from "../../../../../lib/content";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllComponents().map((doc) => ({ slug: doc.slug }));
}

/** The component page as plain Markdown, with every demo inlined as code. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const doc = getComponent((await params).slug);
  if (!doc) return new Response("Not found", { status: 404 });
  return new Response(componentMarkdown(doc), { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
