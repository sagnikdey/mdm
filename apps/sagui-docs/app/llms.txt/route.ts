import { componentsByCategory, foundations, pages } from "../../lib/content";

export const dynamic = "force-static";

/** An index of the docs for coding assistants. Each component links to its Markdown page. */
export function GET() {
  const lines = ["# SagUI", "", "> React components with motion built in. Install with `npm install @sagui/ui`.", "", "## Guides", ""];
  for (const page of [...pages(), ...foundations()]) lines.push(`- [${page.title}](/docs/${page.slug}): ${page.description}`);
  for (const group of componentsByCategory()) {
    lines.push("", `## ${group.title}`, "");
    for (const doc of group.items) lines.push(`- [${doc.title}](/components/${doc.slug}/markdown): ${doc.description}`);
  }
  return new Response(lines.join("\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}
