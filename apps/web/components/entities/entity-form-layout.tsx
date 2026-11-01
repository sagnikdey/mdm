import Link from "next/link"

import {
  Alert,
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export type EntityFormLayoutProps = {
  title: string
  description: string
  cancelHref: string
  isSubmitting: boolean
  submitLabel?: string
  error?: string | null
  onSubmit: React.FormEventHandler<HTMLElement>
  children: React.ReactNode
}

export function EntityFormLayout({
  title,
  description,
  cancelHref,
  isSubmitting,
  submitLabel = "Save",
  error,
  onSubmit,
  children,
}: EntityFormLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <Panel as="form" onSubmit={onSubmit}>
        <PanelHeader>
          <PanelTitle as="h2">{title}</PanelTitle>
          <PanelDescription>{description}</PanelDescription>
        </PanelHeader>
        <PanelContent className="grid gap-5">
          {error ? <Alert tone="danger" title={error} /> : null}
          {children}
        </PanelContent>
        <PanelFooter>
          <Button asChild variant="outline">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </PanelFooter>
      </Panel>
    </div>
  )
}
