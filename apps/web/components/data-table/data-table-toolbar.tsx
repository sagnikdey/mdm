"use client"

import type { Table } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

export interface DataTableFilter {
  columnId: string
  title: string
  options: { label: string; value: string }[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-9 max-w-sm"
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null

            return (
              <Select
                key={filter.columnId}
                value={(column.getFilterValue() as string) ?? "all"}
                onValueChange={(value) =>
                  column.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder={filter.title} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.title}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          })}
          {isFiltered ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2"
            >
              Reset
              <XIcon className="ms-2 size-4" />
            </Button>
          ) : null}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      {isFiltered ? (
        <div className="flex flex-wrap gap-2">
          {table.getState().columnFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary">
              {filter.id}: {String(filter.value)}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
