"use client";

import { useState } from "react";
import { SearchField } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [query, setQuery] = useState("");
  return (
    <div className="w-full max-w-sm">
      <SearchField label="Search components" placeholder="Search" value={query} onValueChange={setQuery} />
    </div>
  );
}
// #endregion

// #region FilterList
export function FilterList() {
  const [query, setQuery] = useState("");
  const items = ["Button", "Input", "Textarea", "Number field", "Phone input", "Tag input"];
  const visible = items.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="grid w-full max-w-sm gap-3">
      <SearchField label="Filter components" placeholder="Filter" value={query} onValueChange={setQuery} />
      <ul className="grid gap-1 text-sm" aria-live="polite">
        {visible.map((item) => <li key={item} className="rounded-md bg-muted px-3 py-2">{item}</li>)}
        {!visible.length && <li className="px-1 text-muted-foreground">Nothing matches “{query}”.</li>}
      </ul>
    </div>
  );
}
// #endregion
