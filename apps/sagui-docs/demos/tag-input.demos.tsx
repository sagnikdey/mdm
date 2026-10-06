"use client";

import { useState } from "react";
import { TagInput } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-md">
      <TagInput label="Topics" defaultValue={["design", "motion"]} description="Press Enter or comma to add a tag." />
    </div>
  );
}
// #endregion

// #region Empty
export function Empty() {
  return (
    <div className="w-full max-w-md">
      <TagInput label="Topics" placeholder="Add a topic" />
    </div>
  );
}
// #endregion

// #region Controlled
export function Controlled() {
  const [tags, setTags] = useState(["react"]);
  return (
    <div className="w-full max-w-md">
      <TagInput
        label="Topics"
        value={tags}
        onValueChange={(next) => setTags(next.map((tag) => tag.toLowerCase()))}
        error={tags.length < 3 ? "Add at least three topics." : undefined}
        description={`${tags.length} of 3 topics`}
      />
    </div>
  );
}
// #endregion

// #region ManyTags
export function ManyTags() {
  return (
    <div className="w-full max-w-md">
      <TagInput label="Topics" defaultValue={["design", "motion", "tokens", "accessibility", "react", "storybook", "typography", "layout"]} />
    </div>
  );
}
// #endregion
