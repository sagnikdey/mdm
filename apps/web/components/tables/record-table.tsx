"use client"

import Link from "next/link"

import { Badge, SortableDataTable } from "@sagui/ui"

type RecordValue = string | number | boolean | null | undefined

export type RecordRow = Record<string, RecordValue> & { id: string }

export type RecordColumn = {
  key: string
  label: string
  /** Row field holding a link target for this cell. */
  hrefKey?: string
  /** Row field shown as a muted second line. */
  secondaryKey?: string
  /** Shows the cell as a badge; these values read as success. */
  successValues?: string[]
  width?: string
}

const CELL_LINK = "font-medium hover:underline"

/**
 * SortableDataTable for server components. Its `render` functions can't cross
 * the server boundary, so cells here are described with plain data.
 */
export function RecordTable({
  caption,
  rows,
  columns,
  emptyMessage,
  itemName,
}: {
  caption: string
  rows: RecordRow[]
  columns: RecordColumn[]
  emptyMessage: string
  itemName: { one: string; other: string }
}) {
  return (
    <SortableDataTable
      caption={caption}
      rows={rows}
      rowKey="id"
      emptyMessage={emptyMessage}
      itemName={itemName}
      columns={columns.map((column) => ({
        key: column.key,
        label: column.label,
        width: column.width,
        render: (value: unknown, row: RecordRow) => {
          const text = String(value ?? "—")
          const href = column.hrefKey ? row[column.hrefKey] : undefined
          const secondary = column.secondaryKey ? row[column.secondaryKey] : undefined
          if (column.successValues) {
            return (
              <Badge tone={column.successValues.includes(text) ? "success" : "neutral"}>
                {text}
              </Badge>
            )
          }
          const main = href ? (
            <Link href={String(href)} className={CELL_LINK}>
              {text}
            </Link>
          ) : (
            text
          )
          return secondary ? (
            <span className="block py-2">
              <span className="block font-medium">{main}</span>
              <span className="block text-xs text-fg-muted">{String(secondary)}</span>
            </span>
          ) : (
            main
          )
        },
      }))}
    />
  )
}
