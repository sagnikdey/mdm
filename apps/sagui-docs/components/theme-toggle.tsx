"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@sagui/ui";

/** Switches data-theme on <html>. The initial value is set by an inline script in the layout, so there is no flash. */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("sagui-theme", next); } catch { /* storage can be blocked */ }
    setTheme(next);
  }
  return (
    <Button variant="ghost" size="icon" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggle} className="size-9">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
