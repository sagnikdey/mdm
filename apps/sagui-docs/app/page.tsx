import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Layers, Sparkles, SquareRoundCorner, Type } from "lucide-react";
import { Accordion, Button, CopyButton } from "@sagui/ui";
import { Showcase } from "../components/home/showcase";
import { MotionDemo } from "../components/home/motion-demo";
import { InstallTabs } from "../components/install-tabs";
import { componentsByCategory, getAllComponents } from "../lib/content";

const github = "https://github.com/sagnikdey/sagui";
const storybook = "https://sagnikdey.github.io/sagui/";
const mcpUrl = "https://sagui-docs.vercel.app/api/mcp";

const faq = [
  { title: "How do I add a component?", content: <p>Install <code className="type-code">@sagui/ui</code>, import its styles in your Tailwind v4 entry, and import components by name. The installation guide covers the Tailwind setup in three lines.</p> },
  { title: "Can my AI tool use SagUI?", content: <p>Yes. Connect it to the SagUI MCP server and it can search for the right component, read its full docs and check the tokens before it writes code. Every page is also plain Markdown, and <code className="type-code">/llms.txt</code> indexes them all.</p> },
  { title: "Can I change how it looks?", content: <p>Components only read semantic tokens. Override the color, radius, type and shadow tokens once and every component follows, in light and dark.</p> },
  { title: "Does motion respect device settings?", content: <p>Yes. Every animation checks prefers-reduced-motion: springs become short fades and nothing moves across the screen.</p> },
  { title: "Is it accessible?", content: <p>Components are built on native elements and Radix primitives, with visible focus rings, full keyboard support and labels on every control. Storybook runs axe checks on every story.</p> },
];

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** The homepage: a live tour of the library, then the foundations, motion and docs that hold it together. */
export default function Home() {
  const count = getAllComponents().length;
  const groups = componentsByCategory();
  return (
    <main className="overflow-x-clip">
      {/* Hero */}
      <section className="mx-auto max-w-[90rem] px-4 pt-4 sm:px-6">
        <div className="home-hero relative isolate overflow-hidden rounded-[28px] border border-border px-6 py-20 text-center sm:py-28 lg:py-36">
          <p className="home-rise type-overline inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-muted-foreground backdrop-blur" style={{ animationDelay: "0ms" }}>
            <Sparkles size={12} aria-hidden="true" /> {count} components · open source
          </p>
          <h1 className="home-rise type-display mx-auto mt-6 max-w-4xl" style={{ animationDelay: "80ms" }}>
            Interfaces that move<br className="hidden sm:block" /> with intent.
          </h1>
          <p className="home-rise type-body-lg mx-auto mt-5 max-w-xl text-muted-foreground" style={{ animationDelay: "160ms" }}>
            SagUI is a React design system with spring motion, accessible defaults and one token layer. Install it from npm, or point your AI tool at the docs and let it build.
          </p>
          <div className="home-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
            <Button asChild size="lg"><Link href="/components">Explore components <ArrowRight aria-hidden="true" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/docs/ai"><Bot aria-hidden="true" /> Give SagUI to your AI</Link></Button>
          </div>
        </div>
      </section>

      {/* Live showcase */}
      <section aria-labelledby="live" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="live" className="type-h1">Every example is live</h2>
            <p className="type-body mt-3 max-w-md text-muted-foreground">Switch the period, change the status, delete the files. Nothing here is a recording.</p>
          </div>
          <Link href="/components" className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
            Browse all {count} components <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <Showcase />
      </section>

      {/* Foundations */}
      <section aria-labelledby="foundations" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32">
        <h2 id="foundations" className="type-h1 max-w-2xl">Foundations first, then components</h2>
        <p className="type-body mt-3 max-w-xl text-muted-foreground">Type, corners and elevation are tokens with roles. Change a token and every component follows, in both themes.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Link href="/docs/typography" className="home-card group">
            <div className="home-card-art">
              <span className="type-display leading-none">Aa</span>
              <span className="type-overline mt-3 text-muted-foreground">Inter · JetBrains Mono</span>
            </div>
            <span className="home-card-title"><Type size={16} aria-hidden="true" /> Typography</span>
            <span className="type-body-sm text-muted-foreground">A type scale and twelve roles that set size, line height, weight and tracking together.</span>
          </Link>
          <Link href="/docs/radius" className="home-card group">
            <div className="home-card-art">
              <div className="rounded-[22px] border border-border bg-muted p-2.5">
                <div className="rounded-[12px] border border-border bg-surface px-6 py-3"><div className="h-7 w-24 rounded-full bg-primary/15" /></div>
              </div>
            </div>
            <span className="home-card-title"><SquareRoundCorner size={16} aria-hidden="true" /> Radius</span>
            <span className="type-body-sm text-muted-foreground">Corners grow with the surface, and nested corners stay concentric.</span>
          </Link>
          <Link href="/docs/elevation" className="home-card group">
            <div className="home-card-art">
              <div className="relative h-24 w-40">
                <div className="absolute inset-x-6 top-0 h-14 rounded-[var(--radius-lg)] border border-border bg-surface shadow-resting" />
                <div className="absolute inset-x-3 top-5 h-14 rounded-[var(--radius-lg)] border border-border bg-surface shadow-raised" />
                <div className="absolute inset-x-0 top-10 h-14 rounded-[var(--radius-lg)] border border-border bg-surface shadow-floating" />
              </div>
            </div>
            <span className="home-card-title"><Layers size={16} aria-hidden="true" /> Shadow and elevation</span>
            <span className="type-body-sm text-muted-foreground">Five levels, with shadows that stay visible in dark mode.</span>
          </Link>
        </div>
      </section>

      {/* Motion */}
      <section aria-labelledby="motion" className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-24 sm:px-6 sm:pt-32 md:grid-cols-2">
        <div>
          <h2 id="motion" className="type-h1">Motion with manners</h2>
          <p className="type-body mt-3 max-w-md text-muted-foreground">Change what a component says and it morphs in place instead of jumping.</p>
          <ul className="type-body-sm mt-6 grid gap-3">
            <li className="flex gap-3"><span className="home-dot" />Labels crossfade while widths spring to fit, so nothing around them shifts.</li>
            <li className="flex gap-3"><span className="home-dot" />Springs are tuned not to overshoot the state a control reports.</li>
            <li className="flex gap-3"><span className="home-dot" />With reduced motion, every spring becomes a short fade.</li>
          </ul>
          <Link href="/docs/motion" className="type-label mt-6 inline-flex items-center gap-1.5 text-primary">How motion works <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="flex justify-center md:justify-end"><MotionDemo /></div>
      </section>

      {/* Docs for people and AI */}
      <section aria-labelledby="docs" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32">
        <div className="grid gap-10 rounded-[28px] border border-border bg-muted/50 p-6 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 id="docs" className="type-h1">Docs for people, and for their AI</h2>
            <p className="type-body mt-3 max-w-md text-muted-foreground">
              Every component has when to use it, when not to, the full API, keyboard and accessibility notes. Connect your assistant to the MCP server and it reads them before it writes code.
            </p>
            <div className="mt-5 flex min-w-0 items-center gap-1 rounded-[var(--radius-md)] border border-border bg-surface py-1 pr-1 pl-3">
              <code className="type-code min-w-0 flex-1 truncate">claude mcp add --transport http sagui {mcpUrl}</code>
              <CopyButton value={`claude mcp add --transport http sagui ${mcpUrl}`} label="Copy command" variant="plain" iconOnly />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary"><Link href="/docs/installation"><BookOpen aria-hidden="true" /> Read the docs</Link></Button>
              <Button asChild variant="ghost"><Link href="/docs/ai">Connect your AI tool</Link></Button>
            </div>
          </div>
          <div className="min-w-0">
            <InstallTabs packages={["@sagui/ui"]} className="!my-0 bg-surface" />
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {groups.map((group) => (
                <li key={group.id}>
                  <Link href={`/components/${group.items[0].slug}`} className="block rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 transition-colors hover:border-border-strong">
                    <span className="type-label block truncate">{group.title}</span>
                    <span className="type-caption text-muted-foreground">{group.items.length} components</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto grid max-w-6xl gap-10 px-4 pt-24 sm:px-6 sm:pt-32 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 id="faq" className="type-h1">Good questions</h2>
          <Link href="/docs/installation" className="type-label mt-4 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">Read the docs <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <Accordion size="lg" items={faq} />
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <h2 className="type-display mx-auto max-w-2xl">Start with one component</h2>
        <p className="type-body-lg mx-auto mt-4 max-w-md text-muted-foreground">Try it on its page, then install it with one command.</p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg"><Link href="/components">Explore components <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="type-title">SagUI</p>
            <p className="type-caption mt-1 text-muted-foreground">Designed and built by Sagnik Dey. Many components adapted from the open source Arc library.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/docs/installation" className="hover:text-foreground">Docs</Link>
            <Link href="/components" className="hover:text-foreground">Components</Link>
            <a href={storybook} className="hover:text-foreground">Storybook</a>
            <a href={github} className="inline-flex items-center gap-1.5 hover:text-foreground"><GithubMark /> GitHub</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
