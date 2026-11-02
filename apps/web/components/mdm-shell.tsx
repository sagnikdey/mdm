"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArchiveIcon,
  Building2Icon,
  GalleryVerticalEndIcon,
  InboxIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { AppShell, Breadcrumb, Select, UserMenu } from "@sagui/ui"

import { usePendingSubmissions } from "@/app/admin/vendor-submissions/use-pending-submissions"
import { UniversalSearch } from "@/components/search/UniversalSearch"
import { useToast } from "@/components/toast-provider"

const TEAMS = [
  { value: "Texas Operations", label: "Texas Operations" },
  { value: "Multi-Region", label: "Multi-Region" },
]

const ROUTE_LABELS: Record<string, string> = {
  stores: "Stores",
  vendors: "Vendors",
  products: "Products",
  inventory: "Inventory",
  search: "Search",
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return [{ label: "Dashboard" }]

  return [
    { label: "Dashboard", href: "/" as string | undefined },
    ...segments.map((segment, index) => ({
      label:
        index === 0 && ROUTE_LABELS[segment]
          ? ROUTE_LABELS[segment]
          : segment.toUpperCase(),
      href:
        index === segments.length - 1
          ? undefined
          : `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ]
}

export function MdmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const showToast = useToast()
  const [team, setTeam] = useState(TEAMS[0]!.value)
  const { data: submissions = [] } = usePendingSubmissions()
  const pendingCount = submissions.length
  const previousCount = useRef<number | null>(null)

  useEffect(() => {
    if (previousCount.current === null) {
      previousCount.current = pendingCount
      return
    }

    if (pendingCount > previousCount.current) {
      const added = pendingCount - previousCount.current
      showToast({
        title: `${added} new vendor submission${added === 1 ? "" : "s"}`,
        description: "Open Submissions to review the latest changes.",
      })
    }

    previousCount.current = pendingCount
  }, [pendingCount, showToast])

  const nav = [
    {
      label: "Master Data",
      items: [
        { label: "Dashboard", href: "/", icon: <LayoutDashboardIcon size={18} /> },
        { label: "Stores", href: "/stores", icon: <Building2Icon size={18} /> },
        { label: "Vendors", href: "/vendors", icon: <UsersIcon size={18} /> },
        { label: "Products", href: "/products", icon: <PackageIcon size={18} /> },
        { label: "Inventory", href: "/inventory", icon: <ArchiveIcon size={18} /> },
        { label: "Search", href: "/search", icon: <SearchIcon size={18} /> },
        { label: "Invite Vendor", href: "/admin/vendors/invite", icon: <UsersIcon size={18} /> },
        { label: "Applications", href: "/admin/applications", icon: <ArchiveIcon size={18} /> },
        {
          label: "Submissions",
          href: "/admin/vendor-submissions",
          icon: <InboxIcon size={18} />,
          badge: pendingCount > 0 ? pendingCount : undefined,
          badgeTone: "danger" as const,
        },
      ],
    },
  ]

  return (
    <AppShell
      variant="inset"
      background="dots"
      gridSize={8}
      nav={nav}
      currentHref={pathname}
      linkComponent={Link}
      brand={<Select label="Team" value={team} options={TEAMS} onValueChange={setTeam} />}
      brandMark={
        <span
          role="img"
          aria-label={team}
          className="flex size-8 items-center justify-center rounded-control bg-accent-default text-fg-on-accent"
        >
          <GalleryVerticalEndIcon className="size-4" />
        </span>
      }
      header={<Breadcrumb items={getBreadcrumbs(pathname)} linkComponent={Link} />}
      actions={
        <>
          <div className="hidden w-80 md:block">
            <UniversalSearch />
          </div>
          <UserMenu
            user={{ name: "MDM Admin", email: "admin@convenience-store.com" }}
            theme={(theme ?? "system") as "light" | "dark" | "system"}
            onThemeChange={setTheme}
          />
        </>
      }
    >
      {children}
    </AppShell>
  )
}
