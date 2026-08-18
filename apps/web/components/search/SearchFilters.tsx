"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"

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
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-medium">Entity Type</h3>
          <div className="space-y-2">
            {ENTITY_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) =>
                    handleTypeChange(type, checked === true)
                  }
                />
                <Label htmlFor={type} className="cursor-pointer capitalize">
                  {type}s
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-medium">Status</h3>
          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={activeOnly === true}
              onCheckedChange={(checked) => handleActiveChange(checked === true)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active Only
            </Label>
          </div>
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </Card>
  )
}
