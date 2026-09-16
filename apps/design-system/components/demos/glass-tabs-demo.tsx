"use client"

import {
  GlassTabs,
  GlassTabsContent,
  GlassTabsList,
  GlassTabsTrigger,
} from "@workspace/ui/components/glass-tabs"

export function GlassTabsDemo() {
  return (
    <GlassTabs defaultValue="catalog" className="w-full max-w-lg">
      <GlassTabsList>
        <GlassTabsTrigger value="catalog">Catalog</GlassTabsTrigger>
        <GlassTabsTrigger value="drafts">Drafts</GlassTabsTrigger>
        <GlassTabsTrigger value="archived">Archived</GlassTabsTrigger>
      </GlassTabsList>
      <GlassTabsContent value="catalog">
        <p className="text-sm text-muted-foreground">
          Live products visible to stores.
        </p>
      </GlassTabsContent>
      <GlassTabsContent value="drafts">
        <p className="text-sm text-muted-foreground">
          Work in progress before submission.
        </p>
      </GlassTabsContent>
      <GlassTabsContent value="archived">
        <p className="text-sm text-muted-foreground">
          Retired SKUs kept for reference.
        </p>
      </GlassTabsContent>
    </GlassTabs>
  )
}
