"use client"

import { useState } from "react"

import { Button, Checkbox } from "@sagui/ui"

import type { EntityType, SearchFilters } from "@/lib/types"

interface SearchFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
}

const ENTITY_TYPES: EntityType[] = ["store", "vendor", "product", "inventory"]

export function SearchFiltersPanel({
  filters,
  onChange,
}: SearchFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<EntityType[]>(
    filters.entityType ?? []
  )
  const [activeOnly, setActiveOnly] = useState(filters.isActive)

  const handleTypeChange = (type: EntityType, checked: boolean) => {
    const updated = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter((t) => t !== type)
    setSelectedTypes(updated)
    onChange({
      ...filters,
      entityType: updated.length > 0 ? updated : undefined,
    })
  }

  const handleActiveChange = (checked: boolean) => {
    setActiveOnly(checked ? true : undefined)
    onChange({
      ...filters,
      isActive: checked ? true : undefined,
    })
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setActiveOnly(undefined)
    onChange({})
  }

  return (
    <div className="space-y-5 p-5">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium">Entity Type</legend>
        {ENTITY_TYPES.map((type) => (
          <Checkbox
            key={type}
            label={`${type[0]!.toUpperCase()}${type.slice(1)}s`}
            checked={selectedTypes.includes(type)}
            onCheckedChange={(checked) => handleTypeChange(type, checked === true)}
          />
        ))}
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium">Status</legend>
        <Checkbox
          label="Active Only"
          checked={activeOnly === true}
          onCheckedChange={(checked) => handleActiveChange(checked === true)}
        />
      </fieldset>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  )
}
