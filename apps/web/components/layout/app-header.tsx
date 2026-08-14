"use client"

import { usePathname } from "next/navigation"

import { UniversalSearch } from "@/components/search/UniversalSearch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/stores": "Stores",
  "/vendors": "Vendors",
  "/products": "Products",
  "/inventory": "Inventory",
  "/search": "Search",
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return [{ href: "/", label: "Dashboard", isCurrent: true }]
  }

  const crumbs = [{ href: "/", label: "Dashboard", isCurrent: false }]
  let path = ""

  segments.forEach((segment, index) => {
    path += `/${segment}`
    const basePath = `/${segments[0]}`
    const label =
      index === 0 && routeLabels[basePath]
        ? routeLabels[basePath]
        : segment.toUpperCase()

    crumbs.push({
      href: path,
      label,
      isCurrent: index === segments.length - 1,
    })
  })

  return crumbs
}

export function AppHeader() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="flex shrink-0 flex-col gap-4 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-12">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="me-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="contents">
                {index > 0 ? (
                  <BreadcrumbSeparator className="hidden md:block" />
                ) : null}
                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                  {crumb.isCurrent ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="px-4 pb-4">
        <UniversalSearch />
      </div>
    </header>
  )
}
