import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// npm workspaces hoist deps to the repo root, so resolve Storybook packages explicitly.
const abs = (pkg: string) => dirname(require.resolve(join(pkg, "package.json")));

const storybookDir = dirname(fileURLToPath(import.meta.url));
/** Storybook dev uses source so `@sagui/ui` works before `packages/ui/dist` is built. */
const saguiUiEntry = join(storybookDir, "../../../packages/ui/src/index.ts");

const config: StorybookConfig = {
  framework: abs("@storybook/react-vite") as "@storybook/react-vite",
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: [abs("@storybook/addon-docs"), abs("@storybook/addon-a11y"), abs("@storybook/addon-themes"), abs("@storybook/addon-mcp"), abs("@storybook/addon-designs")],
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    cfg.base = process.env.STORYBOOK_BASE ?? cfg.base;
    cfg.resolve ??= {};
    const alias = cfg.resolve.alias;
    const uiAlias = { find: /^@sagui\/ui$/, replacement: saguiUiEntry };
    const existing = Array.isArray(alias)
      ? alias
      : alias
        ? Object.entries(alias).map(([find, replacement]) => ({ find, replacement }))
        : [];
    cfg.resolve.alias = [...existing, uiAlias];
    cfg.server ??= {};
    cfg.server.fs ??= {};
    cfg.server.fs.allow = [...(cfg.server.fs.allow ?? []), join(storybookDir, "../../..")];
    return cfg;
  },
};
export default config;
