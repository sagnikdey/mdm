import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { RadiusPage } from "./foundations";

/** Mirrors the "Foundations · Radius" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Radius",
  parameters: { layout: "fullscreen", design: figma("81:11"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const Radius: StoryObj = { name: "Radius", render: () => <RadiusPage /> };
