import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeDocs } from "./rehype-docs";

const root = process.cwd();
const contentDir = path.join(root, "content");
const demosDir = path.join(root, "demos");

export type Category = "buttons" | "inputs" | "special-inputs" | "selection" | "cards" | "messages" | "overlays" | "navigation" | "disclosure" | "data-display" | "charts" | "data" | "text";
export const categories: { id: Category; title: string; blurb: string }[] = [
  { id: "buttons", title: "Buttons", blurb: "Actions, groups, menus and confirmations." },
  { id: "inputs", title: "Inputs", blurb: "Text fields, passwords, search and in-place editing." },
  { id: "special-inputs", title: "Special inputs", blurb: "Numbers, money, phone numbers and tags." },
  { id: "selection", title: "Selection controls", blurb: "Checkboxes, radios, and selects that pick one or many." },
  { id: "navigation", title: "Navigation", blurb: "Tabs and breadcrumbs for moving through content." },
  { id: "disclosure", title: "Disclosure", blurb: "Reveal supporting content in place." },
  { id: "data-display", title: "Data display", blurb: "Avatars and badges that label people and status." },
  { id: "charts", title: "Charts", blurb: "Lines, bars, rings and maps that morph when the data changes." },
  { id: "data", title: "Tables and timeline", blurb: "Sortable records and activity feeds." },
  { id: "text", title: "Text effects", blurb: "Reveals, morphs and shimmers for headings and status text." },
  { id: "cards", title: "Cards", blurb: "Content cards, metrics and empty states." },
  { id: "messages", title: "Messages", blurb: "Persistent alerts and brief confirmations." },
  { id: "overlays", title: "Overlays", blurb: "Dialogs, drawers, sheets and small floating layers." },
];

export interface ComponentDoc {
  slug: string;
  title: string;
  description: string;
  category: Category;
  component: string;
  keywords: string[];
  body: string;
}

const order: Record<Category, string[]> = {
  buttons: ["button", "action-button", "split-button", "button-group", "floating-button-group", "expanding-button-group", "copy-button", "confirm-morph"],
  inputs: ["input", "textarea", "password-field", "password-strength", "search-field", "expanding-search", "inline-edit"],
  "special-inputs": ["number-field", "money-input", "phone-input", "tag-input"],
  selection: ["checkbox", "radio-group", "radio-cards", "select", "morph-select", "combobox", "multi-select", "switch", "segmented-control", "chip-group"],
  navigation: ["tabs", "breadcrumb"],
  disclosure: ["accordion"],
  "data-display": ["avatar", "avatar-group", "badge"],
  charts: ["line-chart", "bar-chart", "donut-chart", "sparkline", "gauge", "streamgraph", "brush-chart", "waffle-chart", "slope-chart", "activity-heatmap", "ridgeline", "treemap"],
  data: ["sortable-data-table", "timeline"],
  text: ["text-reveal", "in-view-title", "text-morph", "text-shimmer"],
  cards: ["card", "metric-card", "empty-state", "animated-counter"],
  messages: ["alert", "toast"],
  overlays: ["dialog", "drawer", "bottom-sheet", "popover", "tooltip"],
};

function read(file: string) {
  return matter(fs.readFileSync(file, "utf8"));
}

export function getComponent(slug: string): ComponentDoc | null {
  const file = path.join(contentDir, "components", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = read(file);
  return { slug, title: data.title, description: data.description, category: data.category, component: data.component, keywords: data.keywords ?? [], body: content };
}

export function getAllComponents(): ComponentDoc[] {
  return Object.values(order).flat().map((slug) => getComponent(slug)).filter((doc): doc is ComponentDoc => !!doc);
}

export function componentsByCategory() {
  const all = getAllComponents();
  return categories.map((category) => ({ ...category, items: all.filter((doc) => doc.category === category.id) })).filter((group) => group.items.length);
}

export interface PageDoc { slug: string; title: string; description: string; body: string }
export function getPage(slug: string): PageDoc | null {
  const file = path.join(contentDir, "pages", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = read(file);
  return { slug, title: data.title, description: data.description, body: content };
}
export const pageSlugs = ["installation", "ai", "theming", "motion", "accessibility"];
export const pages = () => pageSlugs.map((slug) => getPage(slug)).filter((page): page is PageDoc => !!page);
export const foundationSlugs = ["typography", "radius", "elevation"];
export const foundations = () => foundationSlugs.map((slug) => getPage(slug)).filter((page): page is PageDoc => !!page);
/** Pages with live specimens keep them in demos/<slug>.demos.tsx; the rest borrow the button demos. */
export const demoSlugFor = (slug: string) => (fs.existsSync(path.join(demosDir, `${slug}.demos.tsx`)) ? slug : "button");

/** H2 headings, for the "On this page" list. Code fences are skipped. */
export function tocOf(md: string) {
  const slugger = new GithubSlugger();
  const items: { id: string; title: string }[] = [];
  let fenced = false;
  for (const line of md.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    if (fenced) continue;
    const match = /^## (.+)$/.exec(line);
    if (match) items.push({ id: slugger.slug(match[1].trim()), title: match[1].trim() });
  }
  return items;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeShiki, { themes: { light: "github-light", dark: "github-dark-default" }, defaultColor: false })
  .use(rehypeDocs)
  .use(rehypeStringify);

export async function renderMarkdown(md: string) {
  return String(await processor.process(md));
}

export type Block =
  | { type: "html"; html: string }
  | { type: "demo"; name: string; code: string; html: string }
  | { type: "code"; title: string; lang: string; code: string; html: string }
  | { type: "install"; packages: string[] };

const fileNames: Record<string, string> = { tsx: "example.tsx", ts: "example.ts", jsx: "example.jsx", css: "styles.css", html: "index.html", json: "package.json", bash: "Terminal", sh: "Terminal" };
const fence = /^```(\w+)?(?:[ \t]+title="([^"]+)")?[ \t]*\n([\s\S]*?)^```[ \t]*$/gm;

/** Markdown with its top-level code fences pulled out, so each one renders with a header, copy button and line numbers. */
async function markdownBlocks(md: string): Promise<Block[]> {
  const blocks: Block[] = [];
  let last = 0;
  for (const match of md.matchAll(fence)) {
    const before = md.slice(last, match.index);
    if (before.trim()) blocks.push({ type: "html", html: await renderMarkdown(before) });
    last = match.index! + match[0].length;
    const lang = match[1] ?? "text";
    const code = match[3].replace(/\n$/, "");
    const install = /^npm install ([^\n]+)$/.exec(code.trim());
    if (lang === "bash" && install) {
      blocks.push({ type: "install", packages: install[1].trim().split(/\s+/) });
      continue;
    }
    blocks.push({ type: "code", lang, title: match[2] ?? fileNames[lang] ?? lang, code, html: await renderMarkdown("```" + lang + "\n" + code + "\n```") });
  }
  const rest = md.slice(last);
  if (rest.trim()) blocks.push({ type: "html", html: await renderMarkdown(rest) });
  return blocks;
}

/** Splits a page at `<!-- demo: Name -->` markers so live demos sit between rendered markdown sections. */
export async function renderBlocks(md: string, slug: string): Promise<Block[]> {
  const pieces = md.split(/^<!-- demo: (\w+) -->$/m);
  const blocks: Block[] = [];
  for (let index = 0; index < pieces.length; index++) {
    if (index % 2 === 0) {
      blocks.push(...(await markdownBlocks(pieces[index])));
    } else {
      const name = pieces[index];
      const code = demoSource(slug, name);
      blocks.push({ type: "demo", name, code, html: code ? await renderMarkdown("```tsx\n" + code + "\n```") : "" });
    }
  }
  return blocks;
}

/** The body without its opening paragraph when that paragraph repeats the description shown in the page header. */
export function bodyWithoutLead(body: string, description: string) {
  const trimmed = body.trimStart();
  return trimmed.startsWith(description) ? trimmed.slice(description.length) : body;
}

/**
 * The page as plain Markdown for people and coding assistants: demos are inlined as code,
 * so the file stands on its own without the site.
 */
export function componentMarkdown(doc: ComponentDoc) {
  const body = bodyWithoutLead(doc.body, doc.description).replace(/^<!-- demo: (\w+) -->$/gm, (_, name: string) => {
    const code = demoSource(doc.slug, name);
    return code ? "```tsx\n" + code + "\n```" : "";
  });
  const category = categories.find((item) => item.id === doc.category)?.title ?? doc.category;
  return [`# ${doc.title}`, "", `> ${doc.description}`, "", `- Category: ${category}`, `- Import: \`import { ${doc.component} } from "@sagui/ui";\``, `- Page: /components/${doc.slug}`, "", body.trim(), ""]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** The source of one demo, read from its `// #region Name` block in demos/<slug>.demos.tsx, with the imports it uses. */
export function demoSource(slug: string, name: string) {
  const file = path.join(demosDir, `${slug}.demos.tsx`);
  if (!fs.existsSync(file)) return "";
  const text = fs.readFileSync(file, "utf8");
  const region = new RegExp(`// #region ${name}\\n([\\s\\S]*?)// #endregion`).exec(text)?.[1]?.trimEnd();
  if (!region) return "";
  const imports = new Map<string, string>();
  for (const match of text.matchAll(/^import (?:type )?\{([^}]+)\} from "([^"]+)";$/gm)) {
    for (const part of match[1].split(",")) {
      const id = part.trim().replace(/^type /, "").split(" as ")[0];
      if (id) imports.set(id, match[2]);
    }
  }
  const byModule = new Map<string, string[]>();
  for (const [id, module] of imports) {
    if (new RegExp(`\\b${id}\\b`).test(region)) byModule.set(module, [...(byModule.get(module) ?? []), id]);
  }
  const header = [...byModule].map(([module, ids]) => `import { ${ids.join(", ")} } from "${module}";`).join("\n");
  return (header ? header + "\n\n" : "") + region.replace(/^export default /, "");
}
