import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { ColorPage } from "./foundations";

/** Mirrors the "Foundations · Color" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Color",
  parameters: { layout: "fullscreen", design: figma("81:3"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const Color: StoryObj = { name: "Color", render: () => <ColorPage /> };
