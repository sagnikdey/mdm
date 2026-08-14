"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { UniversalSearch } from "@/components/search/UniversalSearch"

export default function SearchPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold">Search MDM</h2>
        <p className="mt-1 text-muted-foreground">
          Find stores, vendors, products, and inventory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Universal Search</CardTitle>
          <CardDescription>
            Press ⌘K anywhere to open search quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UniversalSearch />
        </CardContent>
      </Card>
    </div>
  )
}
