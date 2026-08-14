"use client"

import { Loader2, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"

import { SearchFiltersPanel } from "@/components/search/SearchFilters"
import { SearchResults } from "@/components/search/SearchResults"
import { useSearch } from "@/hooks/useSearch"
import type { SearchResult } from "@/lib/types"

export function UniversalSearch() {
  const router = useRouter()
  const { query, results, isLoading, filters, search, setFilters } = useSearch()
  const [isOpen, setIsOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query) {
      void search(query)
    }
  }, [filters, query, search])

  const handleSearch = (value: string) => {
    void search(value)
  }

  const handleResultClick = (result: SearchResult) => {
    const routes: Record<SearchResult["type"], string> = {
      store: `/stores/${result.id}`,
      vendor: `/vendors/${result.id}`,
      product: `/products/${result.id}`,
      inventory: `/inventory/${result.id}`,
    }
    router.push(routes[result.type])
    setIsOpen(false)
  }

  const clearQuery = () => {
    void search("")
  }

  const hasActiveFilters =
    (filters.entityType?.length ?? 0) > 0 || filters.isActive !== undefined

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search stores, vendors, products, inventory..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pe-20 ps-10"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearQuery}
            className="absolute end-10 top-1/2 -translate-y-1/2"
          >
            <X className="size-4" />
          </Button>
        ) : null}
        <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {query ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2"
        >
          {hasActiveFilters ? (
            <Badge variant="secondary" className="me-2">
              {(filters.entityType?.length ?? 0) +
                (filters.isActive !== undefined ? 1 : 0)}
            </Badge>
          ) : null}
          Filters
        </Button>
      ) : null}

      {isOpen ? (
        <Card className="absolute top-full z-50 mt-2 w-full border shadow-lg">
          {showFilters ? (
            <SearchFiltersPanel filters={filters} onChange={setFilters} />
          ) : (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 p-8">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              ) : null}

              {!isLoading && query && results.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              ) : null}

              {!isLoading && results.length > 0 ? (
                <SearchResults
                  results={results}
                  onResultClick={handleResultClick}
                  query={query}
                />
              ) : null}

              {!isLoading && !query ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <p className="mb-2">Start typing to search</p>
                  <p className="text-xs">
                    Stores • Vendors • Products • Inventory
                  </p>
                </div>
              ) : null}
            </>
          )}
        </Card>
      ) : null}
    </div>
  )
}
