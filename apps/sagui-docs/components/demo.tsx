"use client";

import * as React from "react";
import { CopyButton } from "@sagui/ui";

type DemoModule = Record<string, React.ComponentType>;

/** One lazy loader per component, so a page only downloads the demos it shows. */
const loaders: Record<string, () => Promise<DemoModule>> = {
  "button": () => import("../demos/button.demos"),
  "typography": () => import("../demos/typography.demos"),
  "radius": () => import("../demos/radius.demos"),
  "elevation": () => import("../demos/elevation.demos"),
  "action-button": () => import("../demos/action-button.demos"),
  "split-button": () => import("../demos/split-button.demos"),
  "button-group": () => import("../demos/button-group.demos"),
  "floating-button-group": () => import("../demos/floating-button-group.demos"),
  "expanding-button-group": () => import("../demos/expanding-button-group.demos"),
  "copy-button": () => import("../demos/copy-button.demos"),
  "confirm-morph": () => import("../demos/confirm-morph.demos"),
  "input": () => import("../demos/input.demos"),
  "textarea": () => import("../demos/textarea.demos"),
  "password-field": () => import("../demos/password-field.demos"),
  "password-strength": () => import("../demos/password-strength.demos"),
  "search-field": () => import("../demos/search-field.demos"),
  "expanding-search": () => import("../demos/expanding-search.demos"),
  "inline-edit": () => import("../demos/inline-edit.demos"),
  "number-field": () => import("../demos/number-field.demos"),
  "money-input": () => import("../demos/money-input.demos"),
  "phone-input": () => import("../demos/phone-input.demos"),
  "tag-input": () => import("../demos/tag-input.demos"),
  "checkbox": () => import("../demos/checkbox.demos"),
  "radio-group": () => import("../demos/radio-group.demos"),
  "radio-cards": () => import("../demos/radio-cards.demos"),
  "select": () => import("../demos/select.demos"),
  "morph-select": () => import("../demos/morph-select.demos"),
  "combobox": () => import("../demos/combobox.demos"),
  "multi-select": () => import("../demos/multi-select.demos"),
  "switch": () => import("../demos/switch.demos"),
  "segmented-control": () => import("../demos/segmented-control.demos"),
  "chip-group": () => import("../demos/chip-group.demos"),
  "card": () => import("../demos/card.demos"),
  "metric-card": () => import("../demos/metric-card.demos"),
  "empty-state": () => import("../demos/empty-state.demos"),
  "animated-counter": () => import("../demos/animated-counter.demos"),
  "alert": () => import("../demos/alert.demos"),
  "toast": () => import("../demos/toast.demos"),
  "dialog": () => import("../demos/dialog.demos"),
  "drawer": () => import("../demos/drawer.demos"),
  "bottom-sheet": () => import("../demos/bottom-sheet.demos"),
  "popover": () => import("../demos/popover.demos"),
  "tooltip": () => import("../demos/tooltip.demos"),
  "tabs": () => import("../demos/tabs.demos"),
  "accordion": () => import("../demos/accordion.demos"),
  "breadcrumb": () => import("../demos/breadcrumb.demos"),
  "avatar": () => import("../demos/avatar.demos"),
  "avatar-group": () => import("../demos/avatar-group.demos"),
  "badge": () => import("../demos/badge.demos"),
};

function Live({ slug, name }: { slug: string; name: string }) {
  const Component = React.useMemo(
    () => React.lazy(async () => {
      const mod = await loaders[slug]();
      return { default: mod[name] ?? (() => <p className="text-sm text-muted-foreground">Missing demo: {name}</p>) };
    }),
    [slug, name]
  );
  return (
    <React.Suspense fallback={<span className="text-sm text-muted-foreground">Loading demo</span>}>
      <Component />
    </React.Suspense>
  );
}

/** A live preview with a Code tab. The code is read from the demo's own source, so it cannot drift from what is shown. */
export function Demo({ slug, name, code, codeHtml, bare = false }: { slug: string; name: string; code: string; codeHtml: string; bare?: boolean }) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const id = React.useId();
  return (
    <figure className="demo not-prose my-6 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <div role="tablist" aria-label="Demo view" className="flex gap-1">
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              role="tab"
              id={`${id}-${value}`}
              aria-selected={tab === value}
              aria-controls={`${id}-panel`}
              type="button"
              onClick={() => setTab(value)}
              className="cursor-pointer rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors aria-selected:bg-muted aria-selected:text-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {value === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
        {tab === "code" && code ? <CopyButton value={code} label="Copy code" variant="plain" /> : null}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`}>
        {tab === "preview" ? (
          <div className={bare ? "p-6" : "grid min-h-[200px] place-items-center p-6 sm:p-10"}>
            <div className="flex w-full justify-center">
              <Live slug={slug} name={name} />
            </div>
          </div>
        ) : (
          <div className="code max-h-[28rem] overflow-auto text-[13px]" dangerouslySetInnerHTML={{ __html: codeHtml }} />
        )}
      </div>
    </figure>
  );
}
