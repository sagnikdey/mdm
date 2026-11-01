export const dynamic = "force-dynamic"

import "./globals.css"
import { MdmShell } from "@/components/mdm-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"
import { ReactQueryProvider } from "@/providers/react-query-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-bg-canvas font-sans text-fg-default antialiased">
        <ThemeProvider>
          <ReactQueryProvider>
            <ToastProvider>
              <MdmShell>{children}</MdmShell>
            </ToastProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
