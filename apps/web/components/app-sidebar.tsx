"use client"

import * as React from "react"

import { NavMdm } from "@/components/nav-mdm"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import {
  Building2Icon,
  GalleryVerticalEndIcon,
  MapPinIcon,
} from "lucide-react"

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
  stores: [
    { name: "Downtown Houston", url: "/stores/STR001", icon: <Building2Icon /> },
    { name: "Midtown Plaza", url: "/stores/STR002", icon: <Building2Icon /> },
    { name: "Airport Express", url: "/stores/STR003", icon: <Building2Icon /> },
    { name: "Dallas Central", url: "/stores/STR004", icon: <Building2Icon /> },
    { name: "Fort Worth Station", url: "/stores/STR005", icon: <Building2Icon /> },
    { name: "Austin Convention Center", url: "/stores/STR006", icon: <Building2Icon /> },
    { name: "San Antonio Tower", url: "/stores/STR007", icon: <Building2Icon /> },
    { name: "Corpus Christi Harbor", url: "/stores/STR008", icon: <Building2Icon /> },
    { name: "Lubbock Tech Park", url: "/stores/STR009", icon: <Building2Icon /> },
    { name: "El Paso Downtown", url: "/stores/STR010", icon: <Building2Icon /> },
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
        <NavProjects projects={data.stores} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
