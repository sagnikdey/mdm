import { Poppins, Merriweather, JetBrains_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { KitShell } from "@/components/kit-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const fontSerif = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Lamplight UI Kit",
  description: "Styled React components from the MDM monorepo design system.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontSerif.variable,
          fontMono.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <ThemeProvider>
          <TooltipProvider>
            <KitShell>{children}</KitShell>
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
