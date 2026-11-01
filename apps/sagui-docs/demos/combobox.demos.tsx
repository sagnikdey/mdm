"use client";

import { Combobox } from "@sagui/ui";

const frameworks = [
  { value: "next", label: "Next.js", keywords: ["react"] },
  { value: "remix", label: "Remix", keywords: ["react"] },
  { value: "astro", label: "Astro" },
  { value: "svelte", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
];

// #region Hero
export function Hero() {
  return (
    <div className="h-72 w-full max-w-xs">
      <Combobox label="Framework" options={frameworks} description="Try typing “react”." />
    </div>
  );
}
// #endregion

// #region Selected
export function Selected() {
  return (
    <div className="h-72 w-full max-w-xs">
      <Combobox label="Framework" options={frameworks} defaultValue="astro" />
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="h-72 w-full max-w-xs">
      <Combobox label="Framework" options={frameworks} error="Pick a framework." />
    </div>
  );
}
// #endregion
