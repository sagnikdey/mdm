import type { ComponentType } from "react"

import { AccordionDemo } from "@/components/demos/accordion-demo"
import { BadgeDemo } from "@/components/demos/badge-demo"
import { BreadcrumbDemo } from "@/components/demos/breadcrumb-demo"
import { ButtonDemo } from "@/components/demos/button-demo"
import { CheckboxDemo } from "@/components/demos/checkbox-demo"
import { DialogDemo } from "@/components/demos/dialog-demo"
import { DropdownDemo } from "@/components/demos/dropdown-demo"
import { InputDemo } from "@/components/demos/input-demo"
import { SelectDemo } from "@/components/demos/select-demo"
import { SpinnerDemo } from "@/components/demos/spinner-demo"
import { TabsDemo } from "@/components/demos/tabs-demo"
import { ToastDemo } from "@/components/demos/toast-demo"
import { TooltipDemo } from "@/components/demos/tooltip-demo"

export type FoundationEntry = {
  slug: string
  title: string
  description: string
}

export type ComponentEntry = {
  slug: string
  title: string
  description: string
  category: string
  sourcePath: string
  Demo: ComponentType
}

export const foundationEntries: FoundationEntry[] = [
  {
    slug: "colors",
    title: "Colors",
    description: "Semantic color tokens for light and dark themes.",
  },
  {
    slug: "typography",
    title: "Typography",
    description: "Font families and type scale used across apps.",
  },
  {
    slug: "radius-shadows",
    title: "Radius & shadows",
    description: "Corner radius and elevation shadows.",
  },
]

/** Lab01-style catalog order and naming. */
export const componentEntries: ComponentEntry[] = [
  {
    slug: "button",
    title: "Buttons",
    description: "Primary actions and variants.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/button.tsx",
    Demo: ButtonDemo,
  },
  {
    slug: "input",
    title: "Input",
    description: "Text fields with labels.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/input.tsx",
    Demo: InputDemo,
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Compact status labels.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/badge.tsx",
    Demo: BadgeDemo,
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    description: "Boolean choice control.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/checkbox.tsx",
    Demo: CheckboxDemo,
  },
  {
    slug: "accordion",
    title: "Accordion",
    description: "Expandable sections.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/collapsible.tsx",
    Demo: AccordionDemo,
  },
  {
    slug: "dialog",
    title: "Dialog",
    description: "Modal overlays.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/dialog.tsx",
    Demo: DialogDemo,
  },
  {
    slug: "dropdown",
    title: "Dropdown",
    description: "Menu triggered from a button.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/dropdown-menu.tsx",
    Demo: DropdownDemo,
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    description: "Hierarchy navigation.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/breadcrumb.tsx",
    Demo: BreadcrumbDemo,
  },
  {
    slug: "spinner",
    title: "Spinner",
    description: "Loading indicator.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/skeleton.tsx",
    Demo: SpinnerDemo,
  },
  {
    slug: "select",
    title: "Select",
    description: "Single choice from a list.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/select.tsx",
    Demo: SelectDemo,
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    description: "Context on hover or focus.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/tooltip.tsx",
    Demo: TooltipDemo,
  },
  {
    slug: "tabs",
    title: "Tabs",
    description: "Switch between related views.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/tabs.tsx",
    Demo: TabsDemo,
  },
  {
    slug: "toast",
    title: "Toast",
    description: "Transient notifications.",
    category: "Primitives",
    sourcePath: "packages/ui/src/components/sonner.tsx",
    Demo: ToastDemo,
  },
]

export function getFoundation(slug: string) {
  return foundationEntries.find((entry) => entry.slug === slug)
}

export function getComponent(slug: string) {
  return componentEntries.find((entry) => entry.slug === slug)
}

export function getComponentSlugs() {
  return componentEntries.map((entry) => entry.slug)
}
