import { Badge } from "@sagui/ui"
import { Archive, Building2, Package, Users } from "lucide-react"

import type { EntityType, SearchResult } from "@/lib/types"

interface SearchResultsProps {
  results: SearchResult[]
  onResultClick: (result: SearchResult) => void
  query: string
}

const typeIcons: Record<EntityType, typeof Building2> = {
  store: Building2,
  vendor: Users,
  product: Package,
  inventory: Archive,
}

export function SearchResults({
  results,
  onResultClick,
}: SearchResultsProps) {
  const groupedResults = results.reduce<Record<EntityType, SearchResult[]>>(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<EntityType, SearchResult[]>
  )

  return (
    <div className="max-h-96 overflow-y-auto">
      {Object.entries(groupedResults).map(([type, typeResults]) => {
        const entityType = type as EntityType
        const Icon = typeIcons[entityType]

        return (
          <div key={type}>
            <div className="bg-bg-muted px-4 py-2">
              <p className="text-xs font-semibold text-fg-muted capitalize">
                {type}s ({typeResults.length})
              </p>
            </div>
            {typeResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="flex w-full cursor-pointer items-start gap-3 border-0 bg-transparent px-4 py-3 text-left outline-none hover:bg-bg-muted focus-visible:ring-2 focus-visible:ring-border-focus"
                onClick={() => onResultClick(result)}
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-fg-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg-default">{result.title}</span>
                  <span className="mt-1 block text-xs text-fg-muted">{result.subtitle}</span>
                  {result.matchedFields.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1">
                      {result.matchedFields.slice(0, 3).map((field) => (
                        <Badge key={field} size="sm">
                          {field}
                        </Badge>
                      ))}
                    </span>
                  )}
                </span>
                <Badge size="sm">{Math.round(result.relevanceScore)}</Badge>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
