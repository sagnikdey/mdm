"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchPendingSubmissions } from "@/app/admin/vendor-submissions/actions"

export const PENDING_SUBMISSIONS_QUERY_KEY = ["vendor-submissions"]

export function usePendingSubmissions() {
  return useQuery({
    queryKey: PENDING_SUBMISSIONS_QUERY_KEY,
    queryFn: () => fetchPendingSubmissions(),
    refetchInterval: 15_000,
  })
}
