import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";

export const metadata = {
  title: { default: "SagUI", template: "%s · SagUI" },
  description: "React components with motion built in.",
};

/** Runs before paint, so the saved or system theme is applied without a flash. */
const themeScript = `try{var t=localStorage.getItem("sagui-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-dvh antialiased">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-base font-semibold tracking-tight">SagUI</Link>
              <nav aria-label="Main" className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link href="/docs/installation" className="rounded-[var(--radius-md)] px-3 py-1.5 hover:bg-muted hover:text-foreground">Docs</Link>
                <Link href="/components" className="rounded-[var(--radius-md)] px-3 py-1.5 hover:bg-muted hover:text-foreground">Components</Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
