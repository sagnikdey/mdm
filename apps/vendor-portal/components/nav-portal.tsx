"use client"

import { LayoutDashboardIcon, PackageIcon, SettingsIcon } from "lucide-react"
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
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Products", href: "/products", icon: PackageIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
]

export function NavPortal() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Vendor portal</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
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
