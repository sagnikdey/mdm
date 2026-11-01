"use client";

import { useState } from "react";
import { Check, Copy, Download, Link, Trash2 } from "lucide-react";
import { SplitButton } from "@sagui/ui";

// #region Hero
export function Hero() {
  return (
    <div className="h-48 w-full">
      <div className="flex justify-center">
        <SplitButton
          label="Save"
          actions={[
            { label: "Save as draft" },
            { label: "Save and close" },
            { label: "Discard changes", destructive: true, icon: <Trash2 /> },
          ]}
        />
      </div>
    </div>
  );
}
// #endregion

// #region Secondary
export function Secondary() {
  return (
    <div className="h-48 w-full">
      <div className="flex justify-center">
        <SplitButton variant="secondary" label="Export" actions={[{ label: "Export as CSV" }, { label: "Export as PDF" }]} />
      </div>
    </div>
  );
}
// #endregion

// #region CopyPage
export function CopyPage() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="h-48 w-full">
      <div className="flex justify-center">
        <SplitButton
          variant="secondary"
          label={copied ? "Copied" : "Copy page"}
          icon={copied ? <Check /> : <Copy />}
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }}
          actions={[{ label: "Copy link", icon: <Link /> }, { label: "Download markdown", icon: <Download /> }]}
        />
      </div>
    </div>
  );
}
// #endregion
