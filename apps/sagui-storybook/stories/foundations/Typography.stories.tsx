import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { TypographyPage } from "./foundations";

/** Mirrors the "Foundations · Typography" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Typography",
  parameters: { layout: "fullscreen", design: figma("81:7"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const Typography: StoryObj = { name: "Typography", render: () => <TypographyPage /> };
