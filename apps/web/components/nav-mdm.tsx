"use client"

import { useEffect, useRef } from "react"
import {
  ArchiveIcon,
  Building2Icon,
  InboxIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import { usePendingSubmissions } from "@/app/admin/vendor-submissions/use-pending-submissions"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Stores", href: "/stores", icon: Building2Icon },
  { title: "Vendors", href: "/vendors", icon: UsersIcon },
  { title: "Products", href: "/products", icon: PackageIcon },
  { title: "Inventory", href: "/inventory", icon: ArchiveIcon },
  { title: "Search", href: "/search", icon: SearchIcon },
  { title: "Invite Vendor", href: "/admin/vendors/invite", icon: UsersIcon },
  { title: "Applications", href: "/admin/applications", icon: ArchiveIcon },
  { title: "Submissions", href: "/admin/vendor-submissions", icon: InboxIcon },
]

export function NavMdm() {
  const pathname = usePathname()
  const router = useRouter()
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
      toast.info(
        `${added} new vendor submission${added === 1 ? "" : "s"}`,
        {
          description: "Open Submissions to review the latest changes.",
          action: {
            label: "Review",
            onClick: () => router.push("/admin/vendor-submissions"),
          },
        }
      )
    }

    previousCount.current = pendingCount
  }, [pendingCount, router])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Master Data</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          const showBadge =
            item.href === "/admin/vendor-submissions" && pendingCount > 0

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link href={item.href}>
                  <Icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {showBadge ? (
                <SidebarMenuBadge className="bg-primary text-primary-foreground">
                  {pendingCount}
                </SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
