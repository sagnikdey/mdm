"use client";

import { useState } from "react";
import { Inbox, Search } from "lucide-react";
import { Button, EmptyState } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-dashed border-border">
      <EmptyState title="No projects yet" description="Create your first project to start collaborating with your team." action={<Button>New project</Button>} />
    </div>
  );
}
// #endregion

// #region NoResults
export function NoResults() {
  return (
    <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-dashed border-border">
      <EmptyState
        icon={<Search size={24} />}
        title="No results for “atlas”"
        description="Try a shorter word or check the spelling."
        action={<Button variant="secondary">Clear search</Button>}
      />
    </div>
  );
}
// #endregion

// #region Morphing
export function Morphing() {
  const [caughtUp, setCaughtUp] = useState(false);
  return (
    <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-dashed border-border">
      <EmptyState
        icon={caughtUp ? <Inbox size={24} /> : undefined}
        title={caughtUp ? "You are all caught up" : "No projects yet"}
        description={caughtUp ? "New activity will show up here." : "Create your first project to start collaborating."}
        action={<Button variant="outline" onClick={() => setCaughtUp((value) => !value)}>Toggle state</Button>}
      />
    </div>
  );
}
// #endregion
