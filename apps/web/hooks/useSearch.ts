"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { searchAPI } from "@/lib/api-client"
import type { SearchFilters, SearchResult } from "@/lib/types"

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(
    (q: string) => {
      setQuery(q)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (!q.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      debounceRef.current = setTimeout(() => {
        void searchAPI(q)
          .then((searchResults) => {
            const filtered = applyFilters(searchResults, filters)
            setResults(filtered)
          })
          .catch(() => setResults([]))
          .finally(() => setIsLoading(false))
      }, 300)
    },
    [filters]
  )

  useEffect(() => {
    if (query.trim()) {
      search(query)
    }
  }, [filters, query, search])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    query,
    results,
    isLoading,
    filters,
    search,
    setFilters,
  }
}

function applyFilters(results: SearchResult[], filters: SearchFilters) {
  return results.filter((result) => {
    if (filters.entityType?.length && !filters.entityType.includes(result.type)) {
      return false
    }

    if (filters.region?.length) {
      const region = result.data.region as string | undefined
      if (region && !filters.region.includes(region)) {
        return false
      }
    }

    if (filters.isActive !== undefined) {
      const isActive = result.data.isActive as boolean | undefined
      if (isActive !== undefined && isActive !== filters.isActive) {
        return false
      }
    }

    return true
  })
}
