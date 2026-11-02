"use client"

import { useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { LayoutDashboardIcon, PackageIcon, SettingsIcon, StoreIcon } from "lucide-react"

import { AppShell, Breadcrumb, UserMenu } from "@sagui/ui"

const nav = [
  {
    label: "Vendor portal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboardIcon size={18} /> },
      { label: "Products", href: "/products", icon: <PackageIcon size={18} /> },
      { label: "Settings", href: "/settings", icon: <SettingsIcon size={18} /> },
    ],
  },
]

const SEGMENT_LABELS: Record<string, string> = {
  products: "Products",
  settings: "Settings",
  new: "New",
  add: "Add",
  edit: "Edit",
  review: "Review",
}

function getBreadcrumbs(pathname: string) {
  if (pathname === "/dashboard") return [{ label: "Dashboard" }]

  const segments = pathname.split("/").filter(Boolean)
  return [
    { label: "Dashboard", href: "/dashboard" as string | undefined },
    ...segments.map((segment, index) => ({
      label: SEGMENT_LABELS[segment] ?? segment.toUpperCase(),
      href:
        index === segments.length - 1
          ? undefined
          : `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ]
}

type PortalShellProps = {
  vendorName: string
  email: string
  children: React.ReactNode
}

export function PortalShell({ vendorName, email, children }: PortalShellProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const logoutForm = useRef<HTMLFormElement>(null)

  return (
    <AppShell
      variant="inset"
      background="dots"
      gridSize={8}
      nav={nav}
      currentHref={pathname}
      linkComponent={Link}
      brand={
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-accent-default text-fg-on-accent">
            <StoreIcon className="size-4" />
          </span>
          <span className="grid min-w-0 text-sm leading-tight">
            <span className="truncate font-medium">{vendorName}</span>
            <span className="truncate text-xs text-fg-muted">Vendor portal</span>
          </span>
        </Link>
      }
      brandMark={
        <Link
          href="/dashboard"
          aria-label={`${vendorName} dashboard`}
          className="flex size-8 items-center justify-center rounded-control bg-accent-default text-fg-on-accent"
        >
          <StoreIcon className="size-4" />
        </Link>
      }
      header={<Breadcrumb items={getBreadcrumbs(pathname)} linkComponent={Link} />}
      actions={
        <>
          <UserMenu
            user={{ name: vendorName, email }}
            theme={(theme ?? "system") as "light" | "dark" | "system"}
            onThemeChange={setTheme}
            onSignOut={() => logoutForm.current?.requestSubmit()}
          />
          <form ref={logoutForm} action="/api/auth/logout" method="post" hidden />
        </>
      }
    >
      {children}
    </AppShell>
  )
}
