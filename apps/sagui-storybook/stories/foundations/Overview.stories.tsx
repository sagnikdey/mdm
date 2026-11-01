import type { Meta, StoryObj } from "@storybook/react-vite";
import { figma } from "../../.storybook/figma";
import { OverviewPage } from "./foundations";

/** Mirrors the "Foundations · Overview" frame in Figma, rendered from tokens.json. */
const meta = {
  title: "Foundations/Overview",
  parameters: { layout: "fullscreen", design: figma("81:2"), a11y: { test: "todo" } },
} satisfies Meta;
export default meta;

export const Overview: StoryObj = { name: "Overview", render: () => <OverviewPage /> };
