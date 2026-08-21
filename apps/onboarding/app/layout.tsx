export const dynamic = "force-dynamic"

import { Poppins, Merriweather, JetBrains_Mono } from "next/font/google"
import "@workspace/ui/globals.css"
import { AppLightRays } from "@workspace/ui/components/app-light-rays"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative min-h-screen bg-background font-sans antialiased">
        <AppLightRays />
        <TooltipProvider>
          <div className="relative z-10">{children}</div>
          <Toaster richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  )
}
