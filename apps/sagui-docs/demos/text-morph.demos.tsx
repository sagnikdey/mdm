"use client";

import { useState } from "react";
import { Button, TextMorph } from "@sagui/ui";

// #region Hero
const states = ["Publish", "Publishing", "Published"];
export function Hero() {
  const [index, setIndex] = useState(0);
  return (
    <Button onClick={() => setIndex((value) => (value + 1) % states.length)}>
      <TextMorph>{states[index]}</TextMorph>
    </Button>
  );
}
// #endregion

// #region Heading
const words = ["Design", "Build", "Ship", "Iterate"];
export function Heading() {
  const [index, setIndex] = useState(0);
  return (
    <button type="button" className="cursor-pointer rounded-[var(--radius-md)] text-4xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setIndex((value) => (value + 1) % words.length)}>
      <TextMorph as="span">{words[index]}</TextMorph>
    </button>
  );
}
// #endregion
