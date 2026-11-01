"use client";

import { useState } from "react";
import { Textarea } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-sm">
      <Textarea label="Notes" placeholder="Anything the team should know" />
    </div>
  );
}
// #endregion

// #region LiveCount
export function LiveCount() {
  const [text, setText] = useState("");
  return (
    <div className="w-full max-w-sm">
      <Textarea
        label="Description"
        value={text}
        onChange={(event) => setText(event.target.value)}
        description={`${text.length} of 200 characters`}
        error={text.length > 200 ? "That is over the 200 character limit." : undefined}
      />
    </div>
  );
}
// #endregion

// #region WithError
export function WithError() {
  return (
    <div className="w-full max-w-sm">
      <Textarea label="Reason" error="Tell us why you are cancelling." />
    </div>
  );
}
// #endregion
