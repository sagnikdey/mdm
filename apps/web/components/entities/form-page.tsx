import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import {
  Alert,
  Button,
  Panel,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

export function FormPage({
  eyebrow,
  title,
  description,
  cancelHref,
  isSubmitting,
  submitLabel,
  error,
  onSubmit,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  cancelHref: string
  isSubmitting: boolean
  submitLabel: string
  error?: string | null
  onSubmit: React.FormEventHandler<HTMLElement>
  children: React.ReactNode
}) {
  return (
    <div className="max-w-5xl p-6 mx-auto w-full">
      <Panel as="form" className="overflow-hidden" onSubmit={onSubmit}>
        <PanelHeader className="p-6 md:p-10">
          <p className="mb-4 tracking-widest text-xs font-semibold text-accent-default uppercase">
            {eyebrow}
          </p>
          <PanelTitle as="h2" className="text-3xl font-semibold">
            {title}
          </PanelTitle>
          <PanelDescription className="mt-1.5">{description}</PanelDescription>
        </PanelHeader>

        <div className="px-6 md:px-10">
          {error ? (
            <div className="pb-6">
              <Alert tone="danger" title={error} />
            </div>
          ) : null}
          {children}
        </div>

        <PanelFooter className="gap-4 px-6 py-7 md:px-10 flex-wrap justify-between bg-bg-canvas">
          <div className="gap-1 grid">
            <p className="type-label">Ready when you are.</p>
            <p className="type-caption text-fg-muted">
              Review your entries before saving.
            </p>
          </div>
          <div className="gap-3 flex">
            <Button asChild variant="outline">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              trailingIcon={<ArrowRightIcon className="size-4" />}
            >
              {submitLabel}
            </Button>
          </div>
        </PanelFooter>
      </Panel>
    </div>
  )
}

export function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="gap-6 pt-7 pb-8 grid border-t border-border-default">
      <div className="gap-3 flex items-start">
        <span
          aria-hidden
          className="size-7 flex shrink-0 items-center justify-center rounded-lg bg-accent-subtle type-caption text-accent-default"
        >
          {number}
        </span>
        <div className="min-w-0 gap-1 grid">
          <h3 className="type-h3 text-fg-default">{title}</h3>
          <p className="type-body-sm text-fg-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="gap-6 md:grid-cols-2 grid items-start">{children}</div>
}
