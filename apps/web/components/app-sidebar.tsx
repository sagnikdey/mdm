"use client"

import * as React from "react"

import { NavMdm } from "@/components/nav-mdm"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { GalleryVerticalEndIcon, MapPinIcon } from "lucide-react"

const data = {
  user: {
    name: "MDM Admin",
    email: "admin@convenience-store.com",
    avatar: "",
  },
  teams: [
    {
      name: "Texas Operations",
      logo: <GalleryVerticalEndIcon />,
      plan: "10 stores",
    },
    {
      name: "Multi-Region",
      logo: <MapPinIcon />,
      plan: "Enterprise",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMdm />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
