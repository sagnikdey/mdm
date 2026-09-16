import { KitSection } from "@/components/kit-section"
import { componentEntries } from "@/lib/docs-registry"

export function KitCatalog() {
  return (
    <div className="isolate bg-background relative min-h-screen grid grid-cols-[2rem_minmax(0,60rem)_2rem] min-[960px]:grid-cols-[1fr_60rem_1fr]">
      <div className="col-span-full row-span-full grid grid-cols-subgrid items-start content-start relative z-2 gap-y-8">
      {componentEntries.map((entry, index) => {
        const { Demo } = entry
        return (
          <KitSection
            key={entry.slug}
            id={entry.slug}
            index={index + 1}
            title={entry.title}
            sourcePath={entry.sourcePath}
          >
            <Demo />
          </KitSection>
        )
      })}
      </div>
    </div>
  )
}

export function kitSectionCount() {
  return componentEntries.length
}
