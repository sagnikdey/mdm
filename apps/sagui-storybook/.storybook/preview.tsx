import type { Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { GuidePage } from "./guide-page";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    docs: { page: GuidePage },
    options: {
      storySort: {
        // Same order and names as the Figma file's pages, so a component is in the same place in both.
        order: [
          "Foundations", ["Overview", "Color", "Typography", "Radius", "Spacing", "Borders & controls", "Elevation"],
          "Data Table",
          "Navigation", ["Button", "Button Group", "Copy Button", "Action Button", "Split Button", "Confirm Morph", "Expanding Button Group", "Floating Button Group", "Segmented Control", "Tabs", "Breadcrumb", "Command Palette", "User Menu", "App Shell"],
          "Form Elements", ["Input", "Textarea", "Password Field", "Password Strength", "Search Field", "Expanding Search", "Inline Edit", "Checkbox", "Switch", "Radio Group", "Radio Cards", "Select", "Morph Select", "Multi-select", "Combobox", "Number Field", "Money Input", "Phone Input", "Tag Input"],
          "Overlays", ["Tooltip", "Popover", "Dialog", "Drawer", "Bottom Sheet"],
          "Cards", ["Card", "Empty State", "Approval Card", "Metric Card", "Skeleton", "Animated Counter"],
          "Display", ["Accordion", "Avatar", "Avatar Group", "Chip Group", "Alert", "Badge", "Toast", "Notification Center", "Timeline"],
          "Charts",
          "Text Effects",
        ],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
};
export default preview;
