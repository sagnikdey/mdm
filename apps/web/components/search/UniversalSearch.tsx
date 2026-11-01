"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Badge, Button, SearchField } from "@sagui/ui"

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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        // Both search boxes can be mounted; the shortcut goes to the visible one.
        if (!inputRef.current?.offsetParent) return
        e.preventDefault()
        setIsOpen(true)
        inputRef.current.focus()
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

  const activeFilterCount =
    (filters.entityType?.length ?? 0) + (filters.isActive !== undefined ? 1 : 0)

  return (
    <div ref={searchRef} className="relative w-full">
      <SearchField
        ref={inputRef}
        label="Search"
        hideLabel
        placeholder="Search everything (⌘K)"
        value={query}
        onValueChange={(value) => void search(value)}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-full min-w-72 overflow-hidden rounded-overlay border border-border-default bg-bg-surface shadow-overlay">
          {query ? (
            <div className="border-b border-border-default p-2">
              <Button
                variant="ghost"
                size="sm"
                aria-expanded={showFilters}
                onClick={() => setShowFilters(!showFilters)}
                trailingIcon={
                  activeFilterCount > 0 ? <Badge size="sm">{activeFilterCount}</Badge> : undefined
                }
              >
                Filters
              </Button>
            </div>
          ) : null}

          {showFilters ? (
            <SearchFiltersPanel filters={filters} onChange={setFilters} />
          ) : (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 p-8">
                  <Loader2 className="size-4 motion-safe:animate-spin" />
                  <span className="text-sm text-fg-muted">Searching...</span>
                </div>
              ) : null}

              {!isLoading && query && results.length === 0 ? (
                <div className="p-8 text-center text-sm text-fg-muted">
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
                <div className="p-6 text-center text-sm text-fg-muted">
                  <p className="mb-2">Start typing to search</p>
                  <p className="text-xs">
                    Stores • Vendors • Products • Inventory
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
