"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import type { VendorPortalAccount } from "@workspace/vendor-onboarding/portal-types"
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"
import { grantVendorPortalAccess } from "@/app/admin/vendors/invite/actions"
import { saveVendorAllowedCategories } from "@/app/admin/vendor-submissions/actions"
import { CopyLinkBox } from "@/components/copy-link-box"
import { useToast } from "@/components/toast-provider"
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
  const showToast = useToast()
  const [loginUrl, setLoginUrl] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>(
    account?.allowedCategoryIds ?? []
  )
  const [isGranting, setIsGranting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function grantAccess() {
    setIsGranting(true)
    setActionError(null)
    try {
      const result = await grantVendorPortalAccess(vendorId, email)
      setLoginUrl(result.loginUrl)
      showToast({ title: account ? "Portal login link issued" : "Portal access granted" })
      router.refresh()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not grant access")
    } finally {
      setIsGranting(false)
    }
  }

  async function saveCategories() {
    setIsSaving(true)
    setActionError(null)
    try {
      await saveVendorAllowedCategories(vendorId, selected)
      showToast({ title: "Allowed categories updated" })
      router.refresh()
    } catch (error) {
      setActionError(
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
    <Panel as="section">
      <PanelHeader
        action={
          <Badge tone={account ? "success" : "neutral"}>
            {account?.status ?? "No access"}
          </Badge>
        }
      >
        <PanelTitle as="h2">Vendor portal</PanelTitle>
        <PanelDescription>
          One seat per vendor. Magic-link login uses this email.
        </PanelDescription>
      </PanelHeader>
      <PanelContent className="space-y-5 text-sm">
        {actionError ? <Alert tone="danger" title={actionError} /> : null}

        <dl className="grid gap-3 md:grid-cols-2">
          <div>
            <dt className="text-fg-muted">Portal email</dt>
            <dd className="font-medium">{account?.email ?? email}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Last login</dt>
            <dd className="font-medium">
              {account?.lastLoginAt
                ? new Date(account.lastLoginAt).toLocaleString()
                : "Never"}
            </dd>
          </div>
        </dl>

        <Button type="button" loading={isGranting} onClick={() => void grantAccess()}>
          {account ? "Send login link" : "Grant portal access"}
        </Button>

        {loginUrl ? (
          <CopyLinkBox
            title="Portal login link"
            url={loginUrl}
            copiedMessage="Portal login link copied"
            openLabel="Open portal"
          />
        ) : null}

        {account ? (
          <div className="space-y-3">
            <p className="font-medium">Allowed categories</p>
            <p className="text-fg-muted">
              Catalog submissions will be limited to these categories.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <Checkbox
                  key={category.categoryId}
                  label={category.categoryName}
                  checked={selected.includes(category.categoryId)}
                  onCheckedChange={(value) =>
                    toggleCategory(category.categoryId, value === true)
                  }
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              loading={isSaving}
              onClick={() => void saveCategories()}
            >
              Save categories
            </Button>
          </div>
        ) : (
          <p className="text-fg-muted">
            Grant access first, then choose the categories this vendor may
            submit products in.
          </p>
        )}
      </PanelContent>
    </Panel>
  )
}
