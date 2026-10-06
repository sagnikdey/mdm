"use client";

import * as React from "react";
import { CopyButton } from "@sagui/ui";

const managers = [
  { id: "npm", command: (pkgs: string) => `npm install ${pkgs}` },
  { id: "pnpm", command: (pkgs: string) => `pnpm add ${pkgs}` },
  { id: "yarn", command: (pkgs: string) => `yarn add ${pkgs}` },
  { id: "bun", command: (pkgs: string) => `bun add ${pkgs}` },
] as const;
type Manager = (typeof managers)[number]["id"];

const key = "sagui-package-manager";
const listeners = new Set<() => void>();
function read(): Manager {
  try { return (localStorage.getItem(key) as Manager | null) ?? "npm"; } catch { return "npm"; }
}
function write(value: Manager) {
  try { localStorage.setItem(key, value); } catch { /* storage can be blocked */ }
  listeners.forEach((listener) => listener());
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

/** The install command for each package manager. The choice is remembered and shared by every block on the site. */
export function InstallTabs({ packages, className = "" }: { packages: string[]; className?: string }) {
  const manager = React.useSyncExternalStore(subscribe, read, () => "npm" as Manager);
  const id = React.useId();
  const command = managers.find((item) => item.id === manager)!.command(packages.join(" "));
  return (
    <figure className={`not-prose my-5 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-border py-1 pr-1.5 pl-1.5">
        <div role="tablist" aria-label="Package manager" className="flex gap-0.5">
          {managers.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${id}-${item.id}`}
              aria-selected={manager === item.id}
              aria-controls={`${id}-panel`}
              onClick={() => write(item.id)}
              className="cursor-pointer rounded-[var(--radius-sm)] px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground aria-selected:bg-surface aria-selected:text-foreground aria-selected:shadow-resting focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.id}
            </button>
          ))}
        </div>
        <CopyButton value={command} label="Copy" variant="plain" />
      </div>
      <pre id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${manager}`} className="overflow-x-auto px-4 py-3 font-mono text-[13px] text-foreground">
        <span className="text-muted-foreground select-none">$ </span>{command}
      </pre>
    </figure>
  );
}
