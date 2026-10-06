"use client";

import type { CSSProperties } from "react";
import { Badge, Button, Card, Input } from "@sagui/ui";

// #region Scale
const scale = [
  ["--radius-xs", "4px"],
  ["--radius-sm", "6px"],
  ["--radius-md", "10px"],
  ["--radius-lg", "14px"],
  ["--radius-xl", "20px"],
  ["--radius-2xl", "28px"],
  ["--radius-pill", "9999px"],
];

export function Scale() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
      {scale.map(([token, value]) => (
        <div key={token} className="grid justify-items-center gap-2 text-center">
          <div className="size-16 border-2 border-primary bg-secondary" style={{ borderRadius: `var(${token})` }} />
          <code className="type-code text-xs text-foreground">{token.replace("--radius-", "")}</code>
          <span className="type-caption text-muted-foreground">{value}</span>
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region Roles
export function Roles() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <div className="grid gap-3">
        <p className="type-overline text-muted-foreground">control · 10px</p>
        <div className="flex flex-wrap items-center gap-2"><Button>Save</Button><Button variant="outline">Cancel</Button></div>
        <Input label="Workspace" defaultValue="Atlas" />
      </div>
      <div className="grid gap-3">
        <p className="type-overline text-muted-foreground">container · 14px</p>
        <Card title="Atlas redesign" description="Cards, groups and panels." />
      </div>
      <div className="grid gap-3">
        <p className="type-overline text-muted-foreground">overlay · 20px</p>
        <div className="rounded-[var(--radius-overlay)] border border-border bg-surface p-4 shadow-floating">
          <p className="type-label">Menus, popovers and dialogs</p>
          <p className="type-body-sm text-muted-foreground">The largest surfaces get the softest corners.</p>
        </div>
      </div>
      <div className="grid content-start gap-3">
        <p className="type-overline text-muted-foreground">pill</p>
        <div className="flex flex-wrap gap-2"><Badge tone="success">Live</Badge><Badge>Draft</Badge></div>
      </div>
    </div>
  );
}
// #endregion

// #region Concentric
export function Concentric() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <figure className="grid gap-2">
        <div className="rounded-[20px] border border-border bg-muted p-2">
          <div className="rounded-[12px] border border-border bg-surface p-4 type-body-sm">Inner 20 − 8 = 12px</div>
        </div>
        <figcaption className="type-caption text-muted-foreground">Concentric: inner radius = outer − padding.</figcaption>
      </figure>
      <figure className="grid gap-2">
        <div className="rounded-[20px] border border-border bg-muted p-2">
          <div className="rounded-[20px] border border-border bg-surface p-4 type-body-sm">Inner 20px</div>
        </div>
        <figcaption className="type-caption text-muted-foreground">Same radius inside: the gap pinches at the corners.</figcaption>
      </figure>
    </div>
  );
}
// #endregion

// #region Restyle
const themes = [
  { name: "Sharp", style: { "--radius-xs": "2px", "--radius-sm": "2px", "--radius-md": "4px", "--radius-lg": "6px", "--radius-xl": "8px" } },
  { name: "Default", style: {} },
  { name: "Round", style: { "--radius-sm": "10px", "--radius-md": "16px", "--radius-lg": "22px", "--radius-xl": "28px" } },
];

export function Restyle() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-3">
      {themes.map(({ name, style }) => (
        <div key={name} className="grid gap-3" style={style as CSSProperties}>
          <p className="type-overline text-muted-foreground">{name}</p>
          <Input label="Name" placeholder="Maya Chen" />
          <Button>Continue</Button>
        </div>
      ))}
    </div>
  );
}
// #endregion
