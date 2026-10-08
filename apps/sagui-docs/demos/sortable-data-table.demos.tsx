"use client";

import { Badge, SortableDataTable } from "@sagui/ui";
import { projects } from "./sample-data";

const money = (value: unknown) => `$${Number(value).toLocaleString("en-US")}`;
const tone = { Live: "success", Draft: "neutral", Review: "info" } as const;

// #region Hero
export function Hero() {
  return (
    <div className="w-full max-w-3xl">
      <SortableDataTable
        rows={projects}
        rowKey="id"
        caption="Projects"
        columns={[
          { key: "name", label: "Name" },
          { key: "owner", label: "Owner" },
          { key: "status", label: "Status", render: (value) => <Badge size="sm" tone={tone[value as keyof typeof tone]}>{String(value)}</Badge> },
          { key: "budget", label: "Budget", render: money },
        ]}
        defaultSort={{ key: "name", direction: "asc" }}
      />
    </div>
  );
}
// #endregion

// #region Selectable
export function Selectable() {
  return (
    <div className="w-full max-w-3xl">
      <SortableDataTable
        rows={projects}
        rowKey="id"
        caption="Projects"
        columns={[{ key: "name", label: "Name" }, { key: "owner", label: "Owner" }, { key: "budget", label: "Budget", render: money }, { key: "updated", label: "Updated" }]}
        defaultSort={{ key: "budget", direction: "desc" }}
        selectable
        defaultSelectedKeys={["p2"]}
        itemName={{ one: "project", other: "projects" }}
      />
    </div>
  );
}
// #endregion

// #region Toolbar
export function Toolbar() {
  return (
    <div className="w-full max-w-3xl">
      <SortableDataTable
        rows={projects}
        rowKey="id"
        caption="Projects"
        columns={[
          { key: "name", label: "Name" },
          { key: "owner", label: "Owner", filterable: true },
          { key: "status", label: "Status", filterable: true, render: (value) => <Badge size="sm" tone={tone[value as keyof typeof tone]}>{String(value)}</Badge> },
          { key: "budget", label: "Budget", render: money, searchable: false },
          { key: "updated", label: "Updated" },
        ]}
        defaultSort={{ key: "name", direction: "asc" }}
        searchable
        searchPlaceholder="Search projects"
        viewOptions
        resizableColumns
        defaultHiddenColumns={["updated"]}
        selectable
        itemName={{ one: "project", other: "projects" }}
      />
    </div>
  );
}
// #endregion

// #region Empty
export function Empty() {
  return (
    <div className="w-full max-w-3xl">
      <SortableDataTable rows={[] as typeof projects} rowKey="id" caption="Archived projects" columns={[{ key: "name", label: "Name" }, { key: "owner", label: "Owner" }]} emptyMessage="Nothing archived yet" />
    </div>
  );
}
// #endregion
