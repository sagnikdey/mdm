export const dynamic = "force-dynamic"

import "./globals.css"

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        {children}
      </body>
    </html>
  )
}
