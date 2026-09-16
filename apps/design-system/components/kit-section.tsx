import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

type KitSectionProps = {
  id: string
  index: number
  title: string
  sourcePath?: string
  children: React.ReactNode
  className?: string
}

function formatIndex(index: number) {
  return `#${String(index).padStart(2, "0")}`
}

export function KitSection({
  id,
  index,
  title,
  sourcePath,
  children,
  className,
}: KitSectionProps) {
  return (
    
    <section
      id={id}
      className={cn(
        "col-span-full grid grid-cols-subgrid border-y border-dashed",
        className
      )}
    >
      <div className="bg-striped border-2 border-transparent bg-clip-padding"></div>
        <div className="p-4">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              {title}
            </h2>
            <span className="font-mono text-sm text-muted-foreground tabular-nums">
              {formatIndex(index)}
            </span>
          </div>
          <div className="min-h-16">{children}</div>
          {sourcePath ? (
            <p className="mt-8">
              <Link
                href={`https://github.com/sagnikdey/mdm/blob/main/${sourcePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                View history
              </Link>
            </p>
          ) : null}
        </div>
      <div className="bg-striped border-2 border-transparent bg-clip-padding"></div>
    </section>
    
  )
}
