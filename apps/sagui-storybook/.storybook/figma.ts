/**
 * Links stories to their frames in the SagUI Figma library.
 * The Design panel (@storybook/addon-designs) embeds the frame next to the story,
 * so design and code are reviewed side by side.
 */
export const FIGMA_FILE = "https://www.figma.com/design/kNksgXgWFkl9ejS9RVm2Hq/SagUI-Design-System";

/** `figma("7:126")` → the `design` parameter for the frame with that node id. */
export const figma = (nodeId: string) => ({
  type: "figma" as const,
  url: `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`,
});
