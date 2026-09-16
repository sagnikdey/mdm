import { Lab01ThemeToggle } from "@/components/lab01-theme-toggle"

export function KitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-end px-6 py-5 sm:px-8">
          <Lab01ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
