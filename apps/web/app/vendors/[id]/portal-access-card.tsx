"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import type { VendorPortalAccount } from "@workspace/vendor-onboarding/portal-types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"
import { grantVendorPortalAccess } from "@/app/admin/vendors/invite/actions"
import { saveVendorAllowedCategories } from "@/app/admin/vendor-submissions/actions"
import type { Category } from "@/lib/types"

type PortalAccessCardProps = {
  vendorId: string
  email: string
  account: VendorPortalAccount | null
  categories: Category[]
}

export function PortalAccessCard({
  vendorId,
  email,
  account,
  categories,
}: PortalAccessCardProps) {
  const router = useRouter()
  const [loginUrl, setLoginUrl] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>(
    account?.allowedCategoryIds ?? []
  )
  const [isGranting, setIsGranting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function copyLoginUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Portal login link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  async function grantAccess() {
    setIsGranting(true)
    try {
      const result = await grantVendorPortalAccess(vendorId, email)
      setLoginUrl(result.loginUrl)
      toast.success(
        account ? "Portal login link issued" : "Portal access granted",
        {
          duration: 8000,
          action: {
            label: "Copy link",
            onClick: () => {
              void copyLoginUrl(result.loginUrl)
            },
          },
        }
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not grant access")
    } finally {
      setIsGranting(false)
    }
  }

  async function saveCategories() {
    setIsSaving(true)
    try {
      await saveVendorAllowedCategories(vendorId, selected)
      toast.success("Allowed categories updated")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save categories"
      )
    } finally {
      setIsSaving(false)
    }
  }

  function toggleCategory(categoryId: string, checked: boolean) {
    setSelected((current) =>
      checked
        ? [...current, categoryId]
        : current.filter((id) => id !== categoryId)
    )
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <GlassCardTitle className="text-lg font-semibold">
              Vendor portal
            </GlassCardTitle>
            <GlassCardDescription>
              One seat per vendor. Magic-link login uses this email.
            </GlassCardDescription>
          </div>
          <Badge variant={account ? "active" : "inactive"}>
            {account?.status ?? "No access"}
          </Badge>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-5 text-sm">
        <dl className="grid gap-3 md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Portal email</dt>
            <dd className="font-medium">{account?.email ?? email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last login</dt>
            <dd className="font-medium">
              {account?.lastLoginAt
                ? new Date(account.lastLoginAt).toLocaleString()
                : "Never"}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void grantAccess()} disabled={isGranting}>
            {isGranting
              ? "Issuing..."
              : account
                ? "Send login link"
                : "Grant portal access"}
          </Button>
        </div>

        {loginUrl ? (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <p className="font-medium">Portal login link</p>
            <p className="break-all text-xs text-muted-foreground">{loginUrl}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copyLoginUrl(loginUrl)}
              >
                Copy link
              </Button>
              <Button type="button" size="sm" asChild>
                <a href={loginUrl} target="_blank" rel="noreferrer">
                  Open portal
                </a>
              </Button>
            </div>
          </div>
        ) : null}

        {account ? (
          <div className="space-y-3">
            <p className="font-medium">Allowed categories</p>
            <p className="text-muted-foreground">
              Catalog submissions will be limited to these categories.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => {
                const checked = selected.includes(category.categoryId)
                return (
                  <label
                    key={category.categoryId}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleCategory(category.categoryId, value === true)
                      }
                    />
                    <span>{category.categoryName}</span>
                  </label>
                )
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void saveCategories()}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save categories"}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Grant access first, then choose the categories this vendor may
            submit products in.
          </p>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
