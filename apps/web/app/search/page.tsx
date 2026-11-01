"use client"


import { UniversalSearch } from "@/components/search/UniversalSearch"
import { Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@sagui/ui"

export default function SearchPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Search MDM</h1>
        <p className="mt-1 text-fg-muted">
          Find stores, vendors, products, and inventory
        </p>
      </div>

      <Panel>
        <PanelHeader>
          <PanelTitle as="h2">Universal Search</PanelTitle>
          <PanelDescription>
            Press ⌘K anywhere to open search quickly
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <UniversalSearch />
        </PanelContent>
      </Panel>
    </div>
  )
}
