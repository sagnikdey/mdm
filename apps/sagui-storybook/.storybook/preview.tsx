import type { Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { GuidePage } from "./guide-page";
import "./preview.css";

const preview: Preview = {
  parameters: { layout: "centered", a11y: { test: "error" }, docs: { page: GuidePage } },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
};
export default preview;
