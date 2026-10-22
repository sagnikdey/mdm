// Builds data/*.json from the real sources so the MCP never drifts:
//   packages/tokens/src/tokens.css      -> data/tokens.json
//   apps/docs/content/components/*.md   -> data/components.json
//   apps/docs/content/pages/*.md        -> data/guidelines.json
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const out = join(here, "../data");
mkdirSync(out, { recursive: true });

// ---------- tokens ----------
const css = readFileSync(join(root, "packages/tokens/src/tokens.css"), "utf8");
const block = (re) => (css.match(re) || [, ""])[1];
const decls = (src) => {
  const res = [];
  // keep the nearest preceding comment as a description
  let lastComment = "";
  const re = /\/\*([\s\S]*?)\*\/|(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1]) lastComment = m[1].replace(/\s+/g, " ").trim();
    else { res.push({ name: m[2], value: m[3].trim(), note: lastComment }); lastComment = ""; }
  }
  return res;
};
const light = Object.fromEntries(decls(block(/:root\s*{([\s\S]*?)}/)).map((d) => [d.name, d.value]));
const dark = Object.fromEntries(decls(block(/\[data-theme="dark"\]\s*{([\s\S]*?)}/)).map((d) => [d.name, d.value]));
const themeDecls = [...css.matchAll(/@theme[^{]*{([\s\S]*?)\n}/g)].flatMap((m) => decls(m[1]));

const category = (n) =>
  n.startsWith("--color-") ? "color" :
  n.startsWith("--text-") || n.startsWith("--font") ? "typography" :
  n.startsWith("--radius") ? "radius" :
  n.startsWith("--shadow") ? "elevation" :
  n.startsWith("--ease") || n.startsWith("--duration") ? "motion" :
  n.startsWith("--spacing") ? "spacing" : "other";

const tokens = themeDecls.map(({ name, value, note }) => {
  const ref = value.match(/^var\((--sg-[\w-]+)\)$/)?.[1];
  const t = { name, category: category(name), value };
  if (ref) { t.light = light[ref]; t.dark = dark[ref]; }
  if (name.startsWith("--color-")) t.tailwind = name.slice(8); // bg-primary, text-muted-foreground...
  if (note) t.note = note;
  return t;
});
writeFileSync(join(out, "tokens.json"), JSON.stringify(tokens, null, 2));

// ---------- markdown helpers ----------
const frontmatter = (md) => {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  const fm = {};
  if (!m) return [fm, md];
  let key = null;
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) { key = kv[1]; fm[key] = kv[2] ? kv[2].replace(/^"|"$/g, "") : []; }
    else if (key && /^\s+-\s+/.test(line)) fm[key].push(line.replace(/^\s+-\s+/, "").trim());
  }
  return [fm, md.slice(m[0].length)];
};
const sections = (body) => {
  const s = {};
  const parts = body.split(/^## /m);
  s._intro = parts.shift().replace(/<!--.*?-->/g, "").trim();
  for (const p of parts) {
    const nl = p.indexOf("\n");
    s[p.slice(0, nl).trim()] = p.slice(nl + 1).replace(/<!--.*?-->/g, "").trim();
  }
  return s;
};
const bullets = (t = "") => t.split("\n").filter((l) => /^\s*-\s/.test(l)).map((l) => l.replace(/^\s*-\s+/, "").trim());
const code = (t = "") => [...t.matchAll(/```\w*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
const tableRows = (t) => t.split("\n").filter((l) => l.startsWith("|")).slice(2)
  .map((l) => l.slice(1, -1).split(/(?<!\\)\|/).map((c) => c.trim().replace(/^`|`$/g, "")));

const apiRef = (t = "") => {
  const subs = t.split(/^### /m).slice(1);
  return subs.map((sub) => {
    const nl = sub.indexOf("\n");
    const name = sub.slice(0, nl).trim();
    const rest = sub.slice(nl + 1);
    const description = rest.split("\n").find((l) => l.trim() && !l.startsWith("|"))?.trim();
    const props = tableRows(rest).map(([p, type, def, desc]) => {
      const required = /\(required\)/.test(p);
      return {
        name: p.replace(/`?\s*\(required\)/, "").replace(/`/g, "").trim(),
        type: type?.replace(/\\\|/g, "|"),
        ...(def && def !== "–" ? { default: def } : {}),
        ...(required ? { required } : {}),
        description: desc,
      };
    });
    return { name, description, props };
  });
};

// ---------- components ----------
const compDir = join(root, "apps/docs/content/components");
const components = readdirSync(compDir).filter((f) => f.endsWith(".md")).sort().map((f) => {
  const [fm, body] = frontmatter(readFileSync(join(compDir, f), "utf8"));
  const s = sections(body);
  const exports = apiRef(s["API reference"]);
  return {
    slug: fm.slug,
    name: fm.component || fm.title,
    title: fm.title,
    category: fm.category,
    description: fm.description,
    keywords: fm.keywords || [],
    import: `import { ${[...new Set(exports.map((e) => e.name).concat(fm.component || []))].join(", ")} } from "@sagui/ui";`,
    whenToUse: bullets(s["When to use"]),
    whenNotToUse: bullets(s["When not to use"]),
    usage: code(s["Usage"])[0],
    api: exports,
    keyboard: tableRows(s["Keyboard interactions"] || "").map(([keys, action]) => ({ keys, action })),
    accessibility: bullets(s["Accessibility"]),
    motion: bullets(s["Motion"]),
    responsive: bullets(s["Responsive behavior"]),
    notes: bullets(s["Notes"]),
    related: bullets(s["Related"]).map((l) => l.match(/\(\/components\/([\w-]+)\)/)?.[1]).filter(Boolean),
  };
});
writeFileSync(join(out, "components.json"), JSON.stringify(components, null, 2));

// ---------- guideline pages ----------
const pageDir = join(root, "apps/docs/content/pages");
const guidelines = readdirSync(pageDir).filter((f) => f.endsWith(".md")).sort().map((f) => {
  const [fm, body] = frontmatter(readFileSync(join(pageDir, f), "utf8"));
  return { slug: fm.slug || f.replace(/\.md$/, ""), title: fm.title, description: fm.description, content: body.replace(/<!--.*?-->/g, "").trim() };
});
writeFileSync(join(out, "guidelines.json"), JSON.stringify(guidelines, null, 2));

console.log(`sagui-mcp: ${tokens.length} tokens, ${components.length} components, ${guidelines.length} guideline pages`);
