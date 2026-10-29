import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { ElevationPage } from "./foundations";

/** Mirrors the "Foundations · Elevation" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Elevation",
  parameters: { layout: "fullscreen", design: figma("81:23"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const Elevation: StoryObj = { name: "Elevation", render: () => <ElevationPage /> };
