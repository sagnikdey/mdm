"use client"

import { useQueryClient } from "@tanstack/react-query"
import { EditIcon, EyeIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  Alert,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sagui/ui"

import { useToast } from "@/components/toast-provider"

type EntityRowActionsProps = {
  viewHref: string
  editHref: string
  entityLabel: string
  queryKey: string[]
  onDelete?: () => Promise<void>
}

export function EntityRowActions({
  viewHref,
  editHref,
  entityLabel,
  queryKey,
  onDelete,
}: EntityRowActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const showToast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete() {
    if (!onDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await onDelete()
      showToast({ title: `${entityLabel} deleted` })
      await queryClient.invalidateQueries({ queryKey })
      router.refresh()
      setOpen(false)
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : `Failed to delete ${entityLabel}`
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`${entityLabel} actions`}>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" aria-label={`${entityLabel} actions`} className="grid gap-1">
          <Button asChild variant="ghost" size="sm" className="justify-start">
            <Link href={viewHref}>
              <EyeIcon className="size-4" />
              View
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="justify-start">
            <Link href={editHref}>
              <EditIcon className="size-4" />
              Edit
            </Link>
          </Button>
          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-danger-default"
              leadingIcon={<Trash2Icon className="size-4" />}
              onClick={() => {
                setMenuOpen(false)
                setDeleteError(null)
                setOpen(true)
              }}
            >
              Delete
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={`Delete ${entityLabel}?`}
          description="This action cannot be undone. This will permanently remove the record from the database."
        >
          <div className="grid gap-4">
            {deleteError ? <Alert tone="danger" title={deleteError} /> : null}
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isDeleting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="danger" loading={isDeleting} onClick={() => void handleDelete()}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
