import { plugin as shadcn } from "@shadcn/lint"

/**
 * Registers @shadcn/lint for Tailwind / design-system checks.
 * Add rules under `rules` when you want enforcement (see shadcn/lint docs).
 *
 * @type {import("eslint").Linter.Config}
 */
export const shadcnLintConfig = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: {
    shadcn,
  },
  settings: {
    shadcn: {
      ui: "@workspace/ui/components",
    },
  },
}
