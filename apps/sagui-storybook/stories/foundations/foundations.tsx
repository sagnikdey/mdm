/**
 * Foundation pages, rendered from packages/tokens/tokens.json — the same file the Figma
 * variables mirror — so Storybook, code and Figma can't drift apart. Each swatch, bar and
 * sample reads the generated CSS variable, so the toolbar theme switch applies everywhere.
 */
import type { CSSProperties, ReactNode } from "react";
import tokens from "@sagui/tokens/tokens.json";

type Leaf = { $type: string; $value: string | number; $extensions?: { mode?: Record<string, string> } };
type Tree = { [key: string]: Tree | Leaf | string };
const isLeaf = (n: unknown): n is Leaf => typeof n === "object" && n !== null && "$value" in n;

/** Every token under a node, as [path, leaf] in file order. */
function leaves(node: Tree | Leaf, path: string[] = []): [string[], Leaf][] {
  const out: [string[], Leaf][] = isLeaf(node) ? [[path, node]] : [];
  for (const [k, v] of Object.entries(node)) if (!k.startsWith("$") && typeof v === "object") out.push(...leaves(v as Tree, [...path, k]));
  return out;
}

const T = tokens as unknown as { primitives: Tree; color: Tree; dimension: Tree; type: Tree };
const P = T.primitives;
const PC = P.color as Tree;

/** "{primitives.color.blue.600}" → "blue/600"; "{primitives.size.12}" → "size/12". */
const refName = (v: string) => v.replace(/^\{primitives\.(color\.)?/, "").replace(/\}$/, "").replace(/\./g, "/");

/** Resolves a primitive reference to its raw value. */
function resolve(v: string | number): string | number {
  if (typeof v !== "string" || !v.startsWith("{")) return v;
  let node: unknown = tokens;
  for (const k of v.slice(1, -1).split(".")) node = (node as Tree)[k];
  return resolve((node as Leaf).$value);
}

const label = (k: string) => k.replace(/_/g, ".");

/* ---------- layout ---------- */

export function Page({ title, children, lead }: { title: string; lead: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-canvas p-10 text-fg-default">
      <div className="mx-auto grid max-w-6xl gap-10">
        <header className="grid gap-3">
          <p className="type-overline text-fg-muted">Foundations · {title}</p>
          <h1 className="type-h1">{title}</h1>
          <p className="type-body max-w-[70ch] text-fg-muted">{lead}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Section({ title, children, lead }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h2 className="type-h2">{title}</h2>
        {lead && <p className="type-body max-w-[70ch] text-fg-muted">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

const Code = ({ children, muted }: { children: ReactNode; muted?: boolean }) => (
  <code className={`type-code ${muted ? "text-fg-muted" : ""}`}>{children}</code>
);

/* ---------- overview ---------- */

export function OverviewPage() {
  const tiers = [
    ["Tier 1", "Primitives", "--sg-brand-1-600", "var(--sg-brand-1-600)", "Raw values with no meaning: color ramps, sizes, radii, font values. Never applied to a component directly."],
    ["Tier 2", "Semantic", "--sg-accent-default", "var(--sg-accent-default)", "What a value is for. Points at a primitive, and at a different one in dark mode. The only tokens components use."],
    ["Usage", "Components", "bg-accent-default", "var(--sg-accent-default)", "Utilities and styles read semantic tokens, so a theme or brand change is one edit in tokens.json."],
  ] as const;
  const collections = [
    ["Primitives", "Tier 1", "Ramps, alpha, size, radius, stroke, font. Hidden from publishing in Figma."],
    ["Color", "Tier 2", "bg, fg, border, accent, secondary, status, interactive, on-accent, chart, elevation. Light and Dark."],
    ["Dimension", "Tier 2", "space (Tailwind parity), radius roles, border widths, control heights and padding."],
    ["Type", "Tier 2", "text/{step} scale and the twelve type/{role} roles behind the Type/* text styles."],
  ];
  return (
    <Page title="Overview" lead={<>Two tiers. One source of truth, <Code>packages/tokens/tokens.json</Code>, builds the CSS variables and mirrors the Figma collections. Figma Dev Mode shows the same names you write in code.</>}>
      <Section title="How tokens are layered">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
          {tiers.map(([over, title, ex, color, body], i) => (
            <div key={title} className="contents">
              <div className="grid h-full content-start gap-3 rounded-container border border-border-default bg-bg-surface p-6 shadow-resting">
                <p className="type-overline text-fg-muted">{over}</p>
                <h3 className="type-h3">{title}</h3>
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-inner" style={{ background: color }} />
                  <Code>{ex}</Code>
                </div>
                <p className="type-body-sm text-fg-muted">{body}</p>
              </div>
              {i < 2 && <span className="type-h2 text-fg-muted" aria-hidden>→</span>}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Collections" lead="Each Figma collection maps to a group of CSS variables. Variable code syntax in Figma is set to the CSS name.">
        <Table head={["Collection", "Tier", "Contains"]} rows={collections.map(([a, b, c]) => [<Code>{a}</Code>, b, c])} />
      </Section>
    </Page>
  );
}

/* ---------- color ---------- */

const ramps = Object.keys(PC).filter((k) => k !== "white" && k !== "black");
/** Brand ramps get a display name; the rest show their token key. */
const rampName: Record<string, string> = { "brand-1": "Brand 1 · Iris", "brand-2": "Brand 2 · Raspberry" };

function Swatch({ color, h = 44, checker }: { color: string; h?: number; checker?: boolean }) {
  const bg: CSSProperties = checker
    ? { backgroundImage: `linear-gradient(${color}, ${color}), repeating-conic-gradient(var(--sg-bg-muted) 0 25%, var(--sg-bg-surface) 0 50%)`, backgroundSize: "auto, 12px 12px" }
    : { background: color };
  return <div className="rounded-control-sm border border-border-subtle" style={{ height: h, ...bg }} />;
}

export function ColorPage() {
  const groups: [string, string[]][] = [
    ["Background", ["bg"]], ["Foreground", ["fg"]], ["Border", ["border"]], ["Accent", ["accent"]], ["Secondary", ["secondary"]],
    ["Status", ["success", "warning", "danger"]], ["Interactive overlays", ["interactive", "on-accent"]], ["Chart", ["chart"]], ["Elevation (shadow color)", ["elevation"]],
  ];
  const semantic = leaves(T.color);
  return (
    <Page title="Color" lead="Tier 1 ramps feed Tier 2 semantic tokens. Use the semantic tokens; each one points at a primitive, and at a different one in dark mode.">
      <Section title="Primitive color" lead="Eleven-step OKLCH ramps sharing one lightness curve, so a step reads at the same weight across hues. Brand 1 (Iris) drives the accent; Brand 2 (Raspberry) is the secondary brand color.">
        <div className="grid gap-3">
          {ramps.map((r) => {
            const steps = leaves(PC[r] as Tree);
            return (
              <div key={r} className="grid items-end gap-2" style={{ gridTemplateColumns: `120px repeat(${steps.length}, minmax(0,1fr))` }}>
                <span className="grid"><Code muted>{rampName[r] ?? r}</Code>{rampName[r] && <span className="type-caption text-fg-muted">{r}</span>}</span>
                {steps.map(([[step]]) => (
                  <div key={step} className="grid gap-1" title={`--sg-${r}-${step}`}>
                    <Swatch color={`var(--sg-${r}-${step})`} />
                    <span className="type-caption text-fg-muted">{step}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <h3 className="type-title">Alpha, for overlays and shadows only</h3>
        {(["black", "white"] as const).map((base) => (
          <div key={base} data-theme={base === "white" ? "dark" : "light"} className="flex flex-wrap gap-3 rounded-container border border-border-default bg-bg-surface p-4">
            {leaves(PC[base] as Tree).filter(([p]) => p.length).map(([[a]]) => (
              <div key={a} className="grid w-14 gap-1 text-center">
                <Swatch color={`var(--sg-${base}-${a})`} h={32} checker />
                <span className="type-caption text-fg-muted">{label(a)}</span>
              </div>
            ))}
          </div>
        ))}
      </Section>
      <Section title="Semantic color" lead="Each swatch shows the token and the primitive it points at in that theme. Tints are solid ramp steps; alpha is kept for interactive overlays and elevation.">
        <div className="grid grid-cols-2 gap-6">
          {(["Light", "Dark"] as const).map((mode) => (
            <div key={mode} data-theme={mode.toLowerCase()} className="grid content-start gap-6 rounded-overlay border border-border-default bg-bg-canvas p-8 text-fg-default">
              <h3 className="type-h3">{mode}</h3>
              {groups.map(([name, prefixes]) => (
                <div key={name} className="grid gap-3">
                  <p className="type-overline text-fg-muted">{name}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {semantic.filter(([p]) => prefixes.includes(p[0])).map(([p, leaf]) => {
                      const ref = leaf.$extensions?.mode?.[mode] ?? String(leaf.$value);
                      const alpha = /^(interactive|on-accent|elevation)$/.test(p[0]);
                      return (
                        <div key={p.join("-")} className="grid gap-1">
                          <div className={p[0] === "on-accent" ? "rounded-control-sm bg-accent-default" : undefined}>
                            <Swatch color={`var(--sg-${p.join("-")})`} h={40} checker={alpha && p[0] !== "on-accent"} />
                          </div>
                          <span className="type-caption">{p.join("/")}</span>
                          <span className="type-caption text-fg-muted">{refName(ref)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

/* ---------- typography ---------- */

export function TypographyPage() {
  const roles = T.type.type as Tree;
  const scale = Object.entries(T.type.text as Tree).filter(([k]) => k !== "family" && k !== "weight");
  const n = (l: unknown) => resolve((l as Leaf).$value) as number;
  return (
    <Page title="Typography" lead={<>Inter for interface text, JetBrains Mono for code. Use the <Code>type-*</Code> roles for copy; they match the <Code>Type/*</Code> text styles in Figma one to one.</>}>
      <Section title="Roles">
        <Table
          head={["Utility / Figma style", "Sample", "Size / line height", "Weight", "Tracking"]}
          rows={Object.entries(roles).map(([role, r]) => {
            const t = r as Tree;
            return [
              <div className="grid"><Code>type-{role}</Code><span className="type-caption text-fg-muted">Type/{role}</span></div>,
              <span className={`type-${role}`}>{role === "code" ? "const t = var(--sg-fg-default)" : role === "display" ? "The quick fox" : "The quick brown fox jumps"}</span>,
              <Code>{n(t.size)} / {n(t["line-height"])}</Code>,
              <Code>{n(t.weight)}</Code>,
              <Code>{n(t.tracking)}px</Code>,
            ];
          })}
        />
      </Section>
      <Section title="Scale" lead="For the rare size without a role. Each step carries its own line height and tracking.">
        <div className="flex flex-wrap items-end gap-8">
          {scale.map(([step, s]) => (
            <div key={step} className="grid gap-1">
              <span className="font-medium" style={{ fontSize: `var(--sg-text-${step}-size)`, lineHeight: `var(--sg-text-${step}-line-height)`, letterSpacing: `var(--sg-text-${step}-tracking)` }}>Aa</span>
              <Code>{step}</Code>
              <span className="type-caption text-fg-muted">{n((s as Tree).size)}/{n((s as Tree)["line-height"])}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

/* ---------- radius ---------- */

export function RadiusPage() {
  return (
    <Page title="Radius" lead="Pick by role, not by look: a card is container even when it is small. Nested corners stay concentric: inner radius = outer radius − padding.">
      <Section title="Roles">
        <div className="flex flex-wrap gap-8">
          {leaves(T.dimension.radius as Tree).map(([[role], leaf]) => {
            const px = resolve(leaf.$value) as number;
            return (
              <div key={role} className="grid gap-2">
                <div className="size-22 border border-border-strong bg-bg-muted" style={{ borderRadius: `var(--sg-radius-${role})` }} />
                <Code>rounded-{role}</Code>
                <span className="type-caption text-fg-muted">{refName(String(leaf.$value)).replace("radius/", "")} · {px === 9999 ? "full" : `${px}px`}</span>
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="Concentric corners">
        <div className="grid max-w-xl grid-cols-2 gap-6">
          <div className="rounded-[20px] border border-border-default bg-bg-muted p-2"><div className="type-body-sm rounded-[12px] border border-border-default bg-bg-surface p-4">20 − 8 = 12px</div></div>
          <div className="rounded-[20px] border border-border-default bg-bg-muted p-2"><div className="type-body-sm rounded-[20px] border border-border-default bg-bg-surface p-4">20px inside 20px</div></div>
        </div>
      </Section>
    </Page>
  );
}

/* ---------- spacing ---------- */

export function SpacingPage() {
  const space = leaves(T.dimension.space as Tree).map(([[k], l]) => [k, resolve(l.$value) as number] as const).sort((a, b) => a[1] - b[1]);
  return (
    <Page title="Spacing" lead={<>Tailwind parity on a 4px base: <Code>--sg-space-3</Code> is 12px, the same as <Code>gap-3</Code> or <Code>p-3</Code>. In Figma the variable is <Code>space/3</Code>.</>}>
      <Section title="Scale">
        <div className="grid gap-2">
          {space.map(([k, px]) => (
            <div key={k} className="grid grid-cols-[160px_160px_64px_1fr] items-center gap-4">
              <Code>space/{k}</Code>
              <Code muted>{k.startsWith("neg") ? `-m-${label(k.slice(4))}` : `p-${label(k)}`}</Code>
              <span className="type-caption text-fg-muted">{px}px</span>
              <span className={`h-3 rounded-inner ${px < 0 ? "bg-danger-default" : "bg-accent-default"}`} style={{ width: px < 0 ? `calc(var(--sg-space-${k}) * -1)` : `max(1px, var(--sg-space-${k}))` }} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

/* ---------- borders & controls ---------- */

export function BordersPage() {
  const bw = leaves(T.dimension["border-width"] as Tree);
  const heights = leaves((T.dimension.control as Tree).height as Tree);
  const pad: Record<string, string> = { xs: "sm", sm: "sm", md: "md", lg: "lg" };
  return (
    <Page title="Borders & controls" lead="Border widths for hairlines, emphasis and focus rings; shared heights and horizontal padding for buttons, inputs and selects.">
      <Section title="Border width">
        <div className="grid gap-4">
          {bw.map(([[k], l]) => (
            <div key={k} className="flex items-center gap-4">
              <div className={`h-10 w-32 rounded-control bg-bg-surface ${k === "focus" ? "border-border-focus" : "border-border-strong"}`} style={{ borderStyle: "solid", borderWidth: `var(--sg-border-width-${k})` }} />
              <Code>border-width/{k} · {resolve(l.$value)}px</Code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Control height and padding">
        <div className="flex flex-wrap items-end gap-8">
          {heights.map(([[k], l]) => (
            <div key={k} className="grid gap-2">
              <span className="type-label inline-flex items-center rounded-control bg-accent-default text-fg-on-accent" style={{ height: `var(--sg-control-height-${k})`, paddingInline: `var(--sg-control-padding-x-${pad[k]})` }}>Label</span>
              <Code>control/height/{k}</Code>
              <span className="type-caption text-fg-muted">{resolve(l.$value)}px · padding-x/{pad[k]}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

/* ---------- elevation ---------- */

export function ElevationPage() {
  const levels = [
    ["resting", "Controls and cards at rest"],
    ["raised", "Hovered cards, tooltips"],
    ["floating", "Menus, popovers, toasts"],
    ["overlay", "Dialogs and drawers, above a scrim"],
  ];
  const stack = [
    ["Inline popups (field pickers, expanding search)", "30–40"], ["Modal scrim", "50"], ["Modal panel", "51"], ["Menus", "60"],
    ["Popovers, combobox and multi-select lists", "80"], ["Tooltips", "90"], ["Select lists", "1000"],
  ];
  return (
    <Page title="Elevation" lead={<>Four shadow levels, matching the <Code>Elevation/*</Code> effect styles in Figma. Shadow colors come from the <Code>elevation/*</Code> tokens, so they get denser in dark mode. Every elevated surface keeps a 1px border.</>}>
      <Section title="Levels">
        <div className="grid grid-cols-4 gap-8 rounded-container bg-bg-canvas p-8">
          {levels.map(([k, use]) => (
            <div key={k} className="grid gap-3">
              <div className={`h-24 rounded-container border border-border-subtle bg-bg-surface shadow-${k}`} />
              <div className="grid">
                <Code>shadow-{k}</Code>
                <span className="type-caption text-fg-muted">Elevation/{k} · {use}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Stacking order" lead="Shadows show height; z-index decides what actually covers what.">
        <Table head={["Layer", "z-index"]} rows={stack.map(([a, b]) => [a, <Code>{b}</Code>])} />
      </Section>
    </Page>
  );
}

/* ---------- shared ---------- */

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-border-strong">{head.map((h) => <th key={h} className="type-overline py-2 pr-6 text-fg-muted">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border-subtle">{r.map((c, j) => <td key={j} className="type-body-sm py-3 pr-6 align-middle">{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
