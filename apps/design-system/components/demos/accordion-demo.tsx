"use client"

import { ChevronDownIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { cn } from "@workspace/ui/lib/utils"

const items = [
  {
    title: "Product Information",
    body: "Crafted from premium materials with attention to detail at every step. Each piece is inspected before it ships so you receive something built to last.",
  },
  {
    title: "Shipping Details",
    body: "We offer worldwide shipping through trusted courier partners. Standard delivery takes 3–5 business days, while express shipping ensures delivery within 1–2 business days.",
  },
  {
    title: "Return Policy",
    body: "Returns are accepted within 30 days of delivery. Items must be unused and in their original packaging. Contact support to start a return and receive a prepaid label.",
  },
] as const

export function AccordionDemo() {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {items.map((item) => (
        <Collapsible key={item.title} defaultOpen={item.title === "Product Information"}>
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between gap-4 px-4 py-3 text-start text-sm font-medium",
              "hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180"
            )}
          >
            {item.title}
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground">
            {item.body}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
