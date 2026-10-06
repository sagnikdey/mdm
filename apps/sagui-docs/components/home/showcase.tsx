"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, CircleDashed, CircleDot, Clock, Trash2 } from "lucide-react";
import {
  ActionButton,
  AnimatedCounter,
  AvatarGroup,
  Badge,
  Button,
  ChipGroup,
  ConfirmMorph,
  MetricCard,
  MorphSelect,
  NumberField,
  PasswordStrength,
  SegmentedControl,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toast,
} from "@sagui/ui";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** A live example on the homepage: the component in a panel, with its name and what to try underneath. */
function Tile({ title, hint, href, className = "", children }: { title: string; hint: string; href: string; className?: string; children: React.ReactNode }) {
  return (
    <figure className={`group/tile flex min-w-0 flex-col ${className}`}>
      <div className="relative grid flex-1 place-items-center rounded-[var(--radius-xl)] border border-border bg-surface p-6 shadow-resting sm:p-8">
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_5%,transparent),transparent_60%)]" aria-hidden="true" />
        <div className="relative w-full">{children}</div>
      </div>
      <figcaption className="mt-3 flex items-start justify-between gap-3 px-1">
        <span>
          <span className="type-label block">{title}</span>
          <span className="type-caption text-muted-foreground">{hint}</span>
        </span>
        <Link href={href} aria-label={`${title} docs`} className="mt-0.5 grid size-7 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </figcaption>
    </figure>
  );
}

const periods = {
  "7d": { users: 3120, revenue: 18.4, conversion: 4.2, change: ["+6.1%", "+3.8%", "+0.4 pts"] },
  "30d": { users: 12840, revenue: 74.9, conversion: 4.8, change: ["+12.4%", "+9.2%", "+0.6 pts"] },
  "90d": { users: 35610, revenue: 212.3, conversion: 5.1, change: ["+18.7%", "+15.1%", "+0.9 pts"] },
};
type Period = keyof typeof periods;

function Dashboard() {
  const [period, setPeriod] = React.useState<Period>("30d");
  const data = periods[period];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="type-title">Analytics</p>
          <p className="type-caption text-muted-foreground">sagui.dev · last {period.replace("d", " days")}</p>
        </div>
        <SegmentedControl
          label="Period"
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
          options={[{ value: "7d", label: "7D" }, { value: "30d", label: "30D" }, { value: "90d", label: "90D" }]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Visitors" value={data.users} change={data.change[0]} context="vs previous period" />
        <MetricCard label="Revenue" value={data.revenue} prefix="$" suffix="k" decimals={1} change={data.change[1]} context="vs previous period" />
        <MetricCard label="Conversion" value={data.conversion} suffix="%" decimals={1} change={data.change[2]} context="vs previous period" />
      </div>
    </div>
  );
}

const statuses = [
  { value: "backlog", label: "Backlog", icon: <CircleDashed size={16} /> },
  { value: "progress", label: "In progress", icon: <Clock size={16} /> },
  { value: "review", label: "In review", icon: <CircleDot size={16} /> },
  { value: "done", label: "Done", icon: <Check size={16} /> },
];
const tones = { backlog: "neutral", progress: "warning", review: "info", done: "success" } as const;

function Triage() {
  const [status, setStatus] = React.useState<string | null>("progress");
  const current = statuses.find((item) => item.value === status) ?? statuses[0];
  return (
    <div className="mx-auto grid min-h-[360px] w-full max-w-xs content-start gap-4">
      <div>
        <Badge tone={tones[current.value as keyof typeof tones]} icon={current.icon}>{current.label}</Badge>
        <p className="type-title mt-3">Checkout stalls on Safari 17</p>
        <p className="type-body-sm mt-1 text-muted-foreground">Tapping Pay leaves the spinner running after the card is approved.</p>
      </div>
      <MorphSelect label="Status" items={statuses} value={status} onValueChange={setStatus} />
    </div>
  );
}

function Seats() {
  const [seats, setSeats] = React.useState(8);
  return (
    <div className="mx-auto grid w-full max-w-xs gap-4">
      <div className="flex items-baseline justify-between">
        <p className="type-title">Team plan</p>
        <p className="type-h3 tabular-nums"><AnimatedCounter value={seats * 12} prefix="$" /><span className="type-caption text-muted-foreground"> / mo</span></p>
      </div>
      <NumberField label="Seats" value={seats} onValueChange={setSeats} min={1} max={20} suffix={(n) => (n === 1 ? " seat" : " seats")} scrub description="$12 each. Drag the label to scrub." />
    </div>
  );
}

const topics = ["Design", "Motion", "Tokens", "Accessibility", "React", "Storybook"].map((label) => ({ value: label.toLowerCase(), label }));
const team = ["Maya Chen", "Sam Ortiz", "Priya Nair", "Leo Fischer", "Ana Souza", "Tom Becker", "Ivy Park"].map((name) => ({ name }));

function Team() {
  const [count, setCount] = React.useState(4);
  return (
    <div className="grid justify-items-center gap-5 pt-8">
      <AvatarGroup members={team.slice(0, count)} max={4} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setCount((value) => Math.max(1, value - 1))}>Remove</Button>
        <Button size="sm" variant="outline" onClick={() => setCount((value) => Math.min(team.length, value + 1))}>Add person</Button>
      </div>
    </div>
  );
}

function Saved() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="grid justify-items-center gap-4">
      <Button onClick={() => setOpen(true)} disabled={open}>Save project</Button>
      <div className="flex h-20 w-full items-end justify-center">
        <Toast open={open} onOpenChange={setOpen} title="Project saved" description="Closes itself, or swipe it away." />
      </div>
    </div>
  );
}

/** The live grid. Every tile is the real component, not a recording. */
export function Showcase() {
  return (
    <div className="grid gap-x-5 gap-y-8 md:grid-cols-6">
      <Tile className="md:col-span-4" title="Metric card" hint="Switch the period, the numbers count" href="/components/metric-card"><Dashboard /></Tile>
      <Tile className="md:col-span-2" title="Morph select" hint="The trigger grows into the list" href="/components/morph-select"><Triage /></Tile>
      <Tile className="md:col-span-2" title="Number field" hint="Push past a limit and it pushes back" href="/components/number-field"><Seats /></Tile>
      <Tile className="md:col-span-2" title="Confirm morph" hint="Asks in place, with undo" href="/components/confirm-morph">
        <div className="flex justify-center"><ConfirmMorph label="Delete" icon={<Trash2 />} prompt="Delete 3 files?" onConfirm={() => wait(900)} onUndo={() => wait(600)} /></div>
      </Tile>
      <Tile className="md:col-span-2" title="Action button" hint="Pending, then the result, on the button" href="/components/action-button">
        <div className="flex justify-center"><ActionButton label="Publish" pendingLabel="Publishing" successLabel="Published" onAction={() => wait(1200)} /></div>
      </Tile>
      <Tile className="md:col-span-3" title="Tabs" hint="The highlight glides, panels follow" href="/components/tabs">
        <Tabs defaultValue="overview">
          <TabsList aria-label="Project">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Owners, status and the latest milestone.</TabsContent>
          <TabsContent value="activity"><p>Recent changes by everyone on the team.</p><p className="mt-2">Newest first.</p></TabsContent>
          <TabsContent value="settings">Rename, change visibility or archive.</TabsContent>
        </Tabs>
      </Tile>
      <Tile className="md:col-span-3" title="Chip group" hint="Pick a few, the row makes room" href="/components/chip-group">
        <ChipGroup label="Topics" options={topics} defaultValue={["design", "motion"]} />
      </Tile>
      <Tile className="md:col-span-2" title="Password strength" hint="Rules check off as you type" href="/components/password-strength">
        <PasswordStrength label="New password" />
      </Tile>
      <Tile className="md:col-span-2" title="Avatar group" hint="People join, the stack makes room" href="/components/avatar-group"><Team /></Tile>
      <Tile className="md:col-span-2" title="Toast" hint="Save, and it confirms quietly" href="/components/toast"><Saved /></Tile>
    </div>
  );
}
