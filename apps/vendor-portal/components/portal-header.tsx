"use client"

import { usePathname } from "next/navigation"

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
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/settings": "Settings",
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0 || pathname === "/dashboard") {
    return [{ href: "/dashboard", label: "Dashboard", isCurrent: true }]
  }

  const crumbs = [{ href: "/dashboard", label: "Dashboard", isCurrent: false }]
  let path = ""

  segments.forEach((segment, index) => {
    path += `/${segment}`
    const routeLabel = routeLabels[path]
    const label =
      index === 0 && routeLabel
        ? routeLabel
        : segment === "new"
          ? "New"
          : segment === "edit"
            ? "Edit"
            : (segment ?? path).toUpperCase()

    crumbs.push({
      href: path,
      label,
      isCurrent: index === segments.length - 1,
    })
  })

  return crumbs
}

export function PortalHeader() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-12">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="me-2 shrink-0 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb className="min-w-0 flex-1">
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
    </header>
  )
}
