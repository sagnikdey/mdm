"use client";

import { Archive, Reply, Star, Trash2 } from "lucide-react";
import { ExpandingButtonGroup } from "@sagui/ui";

// #region Hero
export function Hero() {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  return (
    <ExpandingButtonGroup
      label="Message actions"
      items={[
        { id: "reply", label: "Reply", icon: <Reply /> },
        { id: "star", label: "Star", icon: <Star />, doneLabel: "Starred" },
        { id: "archive", label: "Archive", icon: <Archive />, doneLabel: "Archived", onSelect: () => wait(700) },
        { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger", doneLabel: "Deleted" },
      ]}
    />
  );
}
// #endregion

// #region Small
export function Small() {
  return (
    <ExpandingButtonGroup
      size="sm"
      label="Row actions"
      items={[
        { id: "star", label: "Star", icon: <Star />, doneLabel: "Starred" },
        { id: "archive", label: "Archive", icon: <Archive />, doneLabel: "Archived" },
      ]}
    />
  );
}
// #endregion

// #region RestOnArchive
export function RestOnArchive() {
  return (
    <ExpandingButtonGroup
      defaultExpanded="archive"
      label="Message actions"
      items={[
        { id: "reply", label: "Reply", icon: <Reply /> },
        { id: "archive", label: "Archive", icon: <Archive />, doneLabel: "Archived" },
      ]}
    />
  );
}
// #endregion
