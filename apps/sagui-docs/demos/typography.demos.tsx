"use client";

import { Badge, Button } from "@sagui/ui";

// #region Roles
const roles = [
  { role: "type-display", spec: "60 / 1.05 · 600", sample: "Ship calmer interfaces" },
  { role: "type-h1", spec: "40 / 1.1 · 600", sample: "Workspace settings" },
  { role: "type-h2", spec: "24 / 1.25 · 600", sample: "Billing and invoices" },
  { role: "type-h3", spec: "18 / 1.4 · 600", sample: "Payment method" },
  { role: "type-title", spec: "16 / 1.4 · 500", sample: "Atlas redesign" },
  { role: "type-body-lg", spec: "18 / 1.6 · 400", sample: "A lead paragraph that introduces the page." },
  { role: "type-body", spec: "16 / 1.6 · 400", sample: "Body copy for reading: descriptions, articles, help." },
  { role: "type-body-sm", spec: "14 / 1.5 · 400", sample: "Dense UI copy in tables, cards and menus." },
  { role: "type-label", spec: "14 / 1.25 · 500", sample: "Email address" },
  { role: "type-caption", spec: "12 / 1.35 · 400", sample: "Updated 2 hours ago" },
  { role: "type-overline", spec: "11 / 1.2 · 500", sample: "Section label" },
  { role: "type-code", spec: "13 / 1.6 · 400 mono", sample: "npm install @sagui/ui" },
];

export function Roles() {
  return (
    <div className="grid w-full divide-y divide-border">
      {roles.map(({ role, spec, sample }) => (
        <div key={role} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-6">
          <div>
            <code className="type-code text-foreground">{role}</code>
            <p className="type-caption text-muted-foreground">{spec}</p>
          </div>
          <p className={`${role} min-w-0 truncate text-foreground`}>{sample}</p>
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region Scale
const steps = [
  ["text-xs", "12px", "16px"],
  ["text-sm", "14px", "20px"],
  ["text-base", "16px", "24px"],
  ["text-lg", "18px", "28px"],
  ["text-xl", "20px", "28px"],
  ["text-2xl", "24px", "32px"],
  ["text-3xl", "30px", "36px"],
  ["text-4xl", "36px", "40px"],
  ["text-5xl", "48px", "1.1"],
];

export function Scale() {
  return (
    <div className="grid w-full gap-3">
      {steps.map(([step, size, leading]) => (
        <div key={step} className="flex items-baseline gap-4">
          <span className="type-caption w-28 flex-none text-muted-foreground tabular-nums">{step} · {size} / {leading}</span>
          <span className={`${step} truncate font-medium`}>Aa Quiet type</span>
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region Weights
export function Weights() {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-4">
      {[["font-normal", "400", "Regular"], ["font-medium", "500", "Medium"], ["font-semibold", "600", "Semibold"], ["font-bold", "700", "Bold"]].map(([cls, weight, name]) => (
        <div key={cls} className="rounded-[var(--radius-container)] border border-border p-4">
          <p className={`${cls} text-3xl`}>Ag</p>
          <p className="type-caption mt-2 text-muted-foreground">{name} · {weight}</p>
          <code className="type-code text-foreground">{cls}</code>
        </div>
      ))}
    </div>
  );
}
// #endregion

// #region Composition
export function Composition() {
  return (
    <article className="w-full max-w-lg">
      <p className="type-overline text-muted-foreground">Billing</p>
      <h2 className="type-h2 mt-2">Upgrade to Pro</h2>
      <p className="type-body mt-3 max-w-[60ch] text-muted-foreground">
        Unlimited projects, priority support and an audit log for every workspace. You can cancel at any time.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <Button>Upgrade</Button>
        <Badge tone="info">Save 20% yearly</Badge>
      </div>
      <p className="type-caption mt-4 text-muted-foreground">Prices exclude tax.</p>
    </article>
  );
}
// #endregion

// #region Numbers
export function Numbers() {
  const rows = [["Starter", "1,250.00"], ["Growth", "18,400.50"], ["Enterprise", "112,009.99"]];
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <div>
        <p className="type-label mb-2">Proportional</p>
        {rows.map(([name, value]) => <p key={name} className="type-body-sm flex justify-between"><span>{name}</span><span>${value}</span></p>)}
      </div>
      <div>
        <p className="type-label mb-2">tabular-nums</p>
        {rows.map(([name, value]) => <p key={name} className="type-body-sm flex justify-between"><span>{name}</span><span className="tabular-nums">${value}</span></p>)}
      </div>
    </div>
  );
}
// #endregion
