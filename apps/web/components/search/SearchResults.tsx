import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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

const typeColors: Record<EntityType, string> = {
  store: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  vendor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  product: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  inventory: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
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
    <div className="max-h-96 divide-y overflow-y-auto">
      {Object.entries(groupedResults).map(([type, typeResults]) => {
        const entityType = type as EntityType
        const Icon = typeIcons[entityType]

        return (
          <div key={type}>
            <div className="bg-muted px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground capitalize">
                {type}s ({typeResults.length})
              </p>
            </div>
            {typeResults.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="h-auto w-full justify-start px-4 py-3 hover:bg-accent"
                onClick={() => onResultClick(result)}
              >
                <div className="flex w-full items-start gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{result.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.subtitle}
                    </p>
                    {result.matchedFields.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.matchedFields.slice(0, 3).map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge className={typeColors[entityType]}>
                    {Math.round(result.relevanceScore)}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
