import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { SpacingPage } from "./foundations";

/** Mirrors the "Foundations · Spacing" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Spacing",
  parameters: { layout: "fullscreen", design: figma("81:15"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const Spacing: StoryObj = { name: "Spacing", render: () => <SpacingPage /> };
