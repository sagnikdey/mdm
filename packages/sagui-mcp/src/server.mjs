#!/usr/bin/env node
// SagUI MCP server. Reads data/*.json (built by `npm run extract`) and serves it over stdio.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../data");
const load = (f) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));
const tokens = load("tokens.json");
const components = load("components.json");
const guidelines = load("guidelines.json");

const text = (v) => ({ content: [{ type: "text", text: typeof v === "string" ? v : JSON.stringify(v, null, 2) }] });
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const findComponent = (q) => {
  const n = norm(q);
  return components.find((c) => norm(c.slug) === n || norm(c.name) === n || c.api.some((e) => norm(e.name) === n));
};
const dist = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const score = (hay, terms) => terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);

const server = new McpServer({ name: "sagui", version: "0.1.0" });

server.registerTool("list_components", {
  title: "List SagUI components",
  description: "List every SagUI component with its slug, category and one-line description. Call this first when building UI with SagUI to see what already exists before writing a custom component.",
  inputSchema: { category: z.string().optional().describe("Filter by category, e.g. buttons, inputs, selection, charts, overlays") },
}, async ({ category }) => {
  const list = components.filter((c) => !category || c.category === category)
    .map(({ slug, name, category, description }) => ({ slug, name, category, description }));
  return text({ categories: [...new Set(components.map((c) => c.category))], components: list });
});

server.registerTool("get_component", {
  title: "Get a SagUI component",
  description: "Get the full API for one SagUI component: import line, every prop with type and default, usage example, when (not) to use, accessibility, keyboard and related components. Use the exact props returned; never invent props.",
  inputSchema: {
    name: z.string().describe("Component name or slug, e.g. Button, radio-group, DataTable"),
    sections: z.array(z.enum(["api", "usage", "guidance", "accessibility", "motion", "responsive", "notes"])).optional()
      .describe("Limit the response to these sections to save context. Omit for everything."),
  },
}, async ({ name, sections }) => {
  const c = findComponent(name);
  if (!c) {
    const near = components.filter((x) => norm(x.slug).includes(norm(name)) || norm(name).includes(norm(x.slug)) || dist(norm(x.slug), norm(name)) <= 2).map((x) => x.slug);
    return { ...text(`No SagUI component "${name}". ${near.length ? `Did you mean: ${near.join(", ")}?` : "Call list_components or search_components."}`), isError: true };
  }
  if (!sections) return text(c);
  const pick = { slug: c.slug, name: c.name, import: c.import, description: c.description };
  const map = { api: ["api"], usage: ["usage"], guidance: ["whenToUse", "whenNotToUse", "related"], accessibility: ["accessibility", "keyboard"], motion: ["motion"], responsive: ["responsive"], notes: ["notes"] };
  for (const s of sections) for (const k of map[s]) pick[k] = c[k];
  return text(pick);
});

server.registerTool("search_components", {
  title: "Search SagUI components",
  description: "Find SagUI components by intent, e.g. 'pick one plan', 'show a trend', 'confirm delete'. Searches names, descriptions, keywords and when-to-use guidance.",
  inputSchema: { query: z.string(), limit: z.number().int().min(1).max(20).optional() },
}, async ({ query, limit = 6 }) => {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const hits = components.map((c) => {
    const hay = [c.slug, c.name, c.description, ...c.keywords, ...c.whenToUse].join(" ").toLowerCase();
    return { c, s: score(hay, terms) + (hay.includes(query.toLowerCase()) ? 3 : 0) };
  }).filter((h) => h.s > 0).sort((a, b) => b.s - a.s).slice(0, limit)
    .map(({ c }) => ({ slug: c.slug, name: c.name, description: c.description, whenToUse: c.whenToUse }));
  return text(hits.length ? hits : "No matches. Try list_components.");
});

server.registerTool("get_tokens", {
  title: "Get SagUI design tokens",
  description: "Get SagUI design tokens (CSS variables) with light and dark values and their Tailwind utility names. Always style with these tokens; never hardcode hex, oklch, px radii, shadows or durations.",
  inputSchema: {
    category: z.enum(["color", "typography", "radius", "elevation", "motion", "spacing", "other"]).optional(),
    query: z.string().optional().describe("Substring filter on the token name, e.g. 'primary' or 'chart'"),
  },
}, async ({ category, query }) => {
  const res = tokens.filter((t) => (!category || t.category === category) && (!query || t.name.includes(query)));
  return text(res);
});

server.registerTool("get_guidelines", {
  title: "Get SagUI guidelines",
  description: "Read a SagUI foundation guide: accessibility, ai, elevation, installation, motion, radius, theming or typography. Call with no topic to list them.",
  inputSchema: { topic: z.string().optional() },
}, async ({ topic }) => {
  if (!topic) return text(guidelines.map(({ slug, title, description }) => ({ slug, title, description })));
  const g = guidelines.find((x) => norm(x.slug) === norm(topic) || norm(x.title || "") === norm(topic));
  return g ? text(g.content) : { ...text(`No guide "${topic}". Topics: ${guidelines.map((x) => x.slug).join(", ")}`), isError: true };
});

server.registerTool("validate_usage", {
  title: "Check code against SagUI rules",
  description: "Lint a JSX/TSX/CSS snippet for SagUI violations: hardcoded colors, arbitrary px values, raw shadows, and props that don't exist on SagUI components. Run before finishing UI code.",
  inputSchema: { code: z.string() },
}, async ({ code }) => {
  const issues = [];
  const add = (rule, match, fix) => issues.push({ rule, match, fix });
  for (const m of code.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\([^)]*\)/g)) add("no-hardcoded-color", m[0], "Use a color token, e.g. bg-accent-default / text-fg-muted / var(--color-border-default).");
  for (const m of code.matchAll(/\b(?:p|px|py|m|mx|my|gap|w|h|rounded|text)-\[\d+px\]/g)) add("no-arbitrary-px", m[0], "Use the Tailwind scale or a radius role (rounded-[var(--radius-control)]).");
  for (const m of code.matchAll(/box-shadow:\s*[^;]+|shadow-\[[^\]]+\]/g)) add("no-raw-shadow", m[0], "Use --shadow-resting | raised | floating | overlay.");
  for (const m of code.matchAll(/<([A-Z]\w*)\s([^>]*?)\/?>/g)) {
    const c = findComponent(m[1]);
    const exp = c?.api.find((e) => e.name === m[1]);
    if (!exp || !exp.props.length) continue;
    const known = new Set(exp.props.map((p) => p.name).concat(["key", "ref", "className", "style", "children", "id"]));
    for (const a of m[2].matchAll(/(?:^|\s)([a-zA-Z][\w]*)(?==|\s|$)/g)) {
      const p = a[1];
      if (!known.has(p) && !/^(on[A-Z]|aria|data)/.test(p)) add("unknown-prop", `${m[1]}.${p}`, `Not a documented ${m[1]} prop. Valid: ${[...known].join(", ")}`);
    }
  }
  return text(issues.length ? { ok: false, issues } : { ok: true });
});

// Resources, for clients that let you attach context directly.
server.registerResource("tokens", "sagui://tokens", { title: "SagUI tokens", mimeType: "application/json" },
  async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(tokens, null, 2) }] }));
for (const c of components) {
  server.registerResource(`component-${c.slug}`, `sagui://components/${c.slug}`, { title: c.name, description: c.description, mimeType: "application/json" },
    async (uri) => ({ contents: [{ uri: uri.href, text: JSON.stringify(c, null, 2) }] }));
}

await server.connect(new StdioServerTransport());
