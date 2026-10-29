import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { BordersPage } from "./foundations";

/** Mirrors the "Foundations · Borders & controls" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Borders & controls",
  parameters: { layout: "fullscreen", design: figma("81:19"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const BordersAndControls: StoryObj = { name: "Borders & controls", render: () => <BordersPage /> };
