"use client"

import { useState } from "react"

import { Alert, Button } from "@sagui/ui"

import { useToast } from "@/components/toast-provider"

/** A one-time link shown after it's issued, with copy and open actions. */
export function CopyLinkBox({
  title,
  url,
  copiedMessage,
  openLabel,
}: {
  title: string
  url: string
  copiedMessage: string
  openLabel: string
}) {
  const showToast = useToast()
  const [copyFailed, setCopyFailed] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopyFailed(false)
      showToast({ title: copiedMessage })
    } catch {
      setCopyFailed(true)
    }
  }

  return (
    <div className="space-y-2 rounded-control border border-border-default bg-bg-muted p-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs break-all text-fg-muted">{url}</p>
      {copyFailed ? <Alert tone="danger" title="Could not copy link" /> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          Copy link
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            {openLabel}
          </a>
        </Button>
      </div>
    </div>
  )
}
