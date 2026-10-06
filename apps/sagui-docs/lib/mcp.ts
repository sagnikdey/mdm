import fs from "node:fs";
import path from "node:path";
import { categories, componentMarkdown, getAllComponents, getComponent, getPage, type ComponentDoc } from "./content";

/**
 * What the SagUI MCP server answers with. Everything is read from the same markdown the docs site renders,
 * so the server and the site cannot disagree.
 */

/** The public docs origin, so links in tool results work outside the site. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sagui-docs.vercel.app").replace(/\/$/, "");
const absolute = (markdown: string) => markdown.replace(/\]\((\/[^)]*)\)/g, `](${siteUrl}$1)`).replace(/^- Page: (\/\S+)/m, `- Page: ${siteUrl}$1`);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Finds a component by slug ("line-chart"), title ("Line chart") or export name ("LineChart"). */
export function findComponent(name: string): ComponentDoc | null {
  const wanted = normalize(name);
  return getComponent(name.trim().toLowerCase()) ?? getAllComponents().find((doc) => [doc.slug, doc.title, doc.component].some((field) => normalize(field) === wanted)) ?? null;
}

const categoryTitle = (id: string) => categories.find((item) => item.id === id)?.title ?? id;
const line = (doc: ComponentDoc) => `- **${doc.title}** (\`${doc.component}\`, slug \`${doc.slug}\`): ${doc.description}`;

export function listComponents(category?: string) {
  const all = getAllComponents();
  const groups = categories
    .filter((group) => !category || normalize(group.id) === normalize(category) || normalize(group.title) === normalize(category))
    .map((group) => ({ group, docs: all.filter((doc) => doc.category === group.id) }))
    .filter(({ docs }) => docs.length);
  if (!groups.length) return `No category matches "${category}". Categories: ${categories.map((group) => group.id).join(", ")}.`;
  const body = groups.map(({ group, docs }) => [`## ${group.title} (\`${group.id}\`)`, group.blurb, "", ...docs.map(line)].join("\n")).join("\n\n");
  const count = groups.reduce((sum, { docs }) => sum + docs.length, 0);
  return `# SagUI components (${count})\n\nImport any of them from "@sagui/ui". Call get_component with a slug for its full docs.\n\n${body}\n`;
}

/** The "When to use" section, which says best what a component is for. */
const whenToUse = (doc: ComponentDoc) => /^## When to use\n([\s\S]*?)(?=^## )/m.exec(doc.body)?.[1] ?? "";

const stopWords = new Set(["an", "the", "to", "of", "for", "in", "on", "over", "with", "and", "or", "my", "me", "is", "it", "that", "this", "some", "show", "use", "want", "need", "how", "can", "do", "what", "which", "component", "components", "ui", "user", "users", "people", "something", "thing", "things", "when", "where"]);

/** Ranks components for a need described in plain words, weighting names over descriptions over usage notes. */
export function searchComponents(query: string, limit = 8) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1 && !stopWords.has(term));
  if (!terms.length) return "Describe what you need, such as \"pick a date range\" or \"show a trend over time\".";
  const scored = getAllComponents()
    .map((doc) => {
      const fields: [string, number][] = [
        [`${doc.title} ${doc.component} ${doc.slug}`.toLowerCase(), 6],
        [doc.keywords.join(" ").toLowerCase(), 4],
        [`${doc.description} ${categoryTitle(doc.category)}`.toLowerCase(), 3],
        [whenToUse(doc).toLowerCase(), 1],
      ];
      // A whole word counts fully and the start of a longer word ("sort" in "sortable") counts half,
      // so "over" never hits "popover" and "time" prefers "time series" to "timeline".
      const score = terms.reduce((total, term) => {
        const whole = new RegExp(`\\b${term}s?\\b`), start = new RegExp(`\\b${term}`);
        return total + fields.reduce((sum, [text, weight]) => sum + (whole.test(text) ? weight : start.test(text) ? weight / 2 : 0), 0);
      }, 0);
      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  if (!scored.length) return `Nothing matches "${query}". Call list_components to see everything.`;
  return `# Components for "${query}"\n\n${scored.map(({ doc }) => line(doc)).join("\n")}\n\nCall get_component with a slug for when to use it, its API and examples.\n`;
}

export function getComponentDocs(name: string) {
  const doc = findComponent(name);
  if (doc) return absolute(componentMarkdown(doc));
  const close = searchComponents(name, 5);
  return `No component is called "${name}".\n\n${close}`;
}

const pageText = (slug: string) => {
  const page = getPage(slug);
  return page ? absolute(`# ${page.title}\n\n> ${page.description}\n\n${page.body.trim()}\n`) : "";
};

export function getInstall() {
  return pageText("installation");
}

export const tokenTopics = ["overview", "typography", "radius", "elevation", "motion", "css"] as const;
export type TokenTopic = (typeof tokenTopics)[number];

const tokensFile = path.join(process.cwd(), "..", "..", "packages", "tokens", "src", "tokens.css");

/** Token guidance by topic. "css" returns the token file itself, the source of truth for every value. */
export function getTokens(topic: TokenTopic = "overview") {
  if (topic === "css") return "```css\n" + fs.readFileSync(tokensFile, "utf8").trim() + "\n```\n";
  const slug = topic === "overview" ? "theming" : topic;
  return pageText(slug);
}

export const instructions = [
  "SagUI is a React design system (Tailwind CSS v4, Radix primitives, motion). Components import from \"@sagui/ui\".",
  "Before writing UI with SagUI, call search_components or list_components to pick a component, then get_component for its exact props.",
  "Use only the documented props; do not invent variants. Style with the semantic tokens from get_tokens, not raw colors.",
].join(" ");
