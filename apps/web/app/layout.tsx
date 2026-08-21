import { Poppins, Merriweather, JetBrains_Mono } from "next/font/google"

export const dynamic = "force-dynamic"

import "@workspace/ui/globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/providers/react-query-provider"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { AppLightRays } from "@workspace/ui/components/app-light-rays"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased")}
    >
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AppLightRays />
          <TooltipProvider>
            <ReactQueryProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="relative z-10 bg-transparent">
                  <AppHeader />
                  <main className="flex-1 overflow-auto">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </ReactQueryProvider>
          </TooltipProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
