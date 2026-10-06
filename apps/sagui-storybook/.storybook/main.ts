import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
// npm workspaces hoist deps to the repo root, so resolve Storybook packages explicitly.
const abs = (pkg: string) => dirname(require.resolve(join(pkg, "package.json")));

const config: StorybookConfig = {
  framework: abs("@storybook/react-vite") as "@storybook/react-vite",
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: [abs("@storybook/addon-docs"), abs("@storybook/addon-a11y"), abs("@storybook/addon-themes"), abs("@storybook/addon-mcp")],
  viteFinal: async (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    cfg.base = process.env.STORYBOOK_BASE ?? cfg.base;
    return cfg;
  },
};
export default config;
