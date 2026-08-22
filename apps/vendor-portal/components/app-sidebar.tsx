"use client"

import { NavPortal } from "@/components/nav-portal"
import { PortalUser } from "@/components/portal-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { StoreIcon } from "lucide-react"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  vendorName: string
  email: string
}

export function AppSidebar({ vendorName, email, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <StoreIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{vendorName}</span>
                  <span className="truncate text-xs">Vendor portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPortal />
      </SidebarContent>
      <SidebarFooter>
        <PortalUser user={{ name: vendorName, email }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
