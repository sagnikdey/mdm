"use client"

import {
  ArchiveIcon,
  Building2Icon,
  LayoutDashboardIcon,
  PackageIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
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
]

export function NavMdm() {
  const pathname = usePathname()

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

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link href={item.href}>
                  <Icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
