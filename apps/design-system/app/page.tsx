import Link from "next/link"

import { KitCatalog, kitSectionCount } from "@/components/kit-catalog"

export default function HomePage() {
  const count = kitSectionCount()

  return (
    <>
      <div className="mx-auto max-w-5xl py-8 sm:px-8 sm:pt-24">
        <p className="text-base text-muted-foreground sm:text-lg">
          {count} styled react components
        </p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl md:text-5xl">
          Lamplight Design System
        </h1>
        <p className="mt-2">
          <Link
            href="https://github.com/sagnikdey/mdm/tree/main/packages/ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            github.com/sagnikdey/mdm ✦✧
          </Link>
        </p>
      </div>
      <KitCatalog />
    </>
  )
}
