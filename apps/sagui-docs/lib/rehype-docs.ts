import type { Element, ElementContent, Root, Text } from "hast";

const text = (value: string): Text => ({ type: "text", value });
const el = (tagName: string, className: string | undefined, children: ElementContent[], properties: Element["properties"] = {}): Element => ({
  type: "element",
  tagName,
  properties: className ? { ...properties, className: [className] } : properties,
  children,
});
const textOf = (node: ElementContent): string => (node.type === "text" ? node.value : node.type === "element" ? node.children.map(textOf).join("") : "");
const children = (node: Element, tagName: string) => node.children.filter((child): child is Element => child.type === "element" && child.tagName === tagName);

/** "Shift + Tab / Escape (in a list)" becomes <kbd>Shift</kbd> + <kbd>Tab</kbd> or <kbd>Escape</kbd> with a trailing note. */
function keys(label: string): ElementContent[] {
  const out: ElementContent[] = [];
  const note = /\s*\(([^)]+)\)\s*$/.exec(label);
  const body = note ? label.slice(0, note.index) : label;
  const sep = (value: string) => out.push(el("span", "kbd-sep", [text(value)]));
  body.trim().split(/\s+\/\s+|\s+or\s+/).forEach((alternative, index) => {
    if (index) sep("or");
    alternative.split(/\s+then\s+/).forEach((step, stepIndex) => {
      if (stepIndex) sep("then");
      const parts = step.trim() === "+" ? ["+"] : step.split(/\s*\+\s*/).filter(Boolean);
      parts.forEach((key, keyIndex) => {
        if (keyIndex) sep("+");
        out.push(el("kbd", undefined, [text(key.trim())]));
      });
    });
  });
  if (note) out.push(el("span", "kbd-note", [text(note[1])]));
  return out;
}

/** A Related list item "[Title](/x): description" becomes a card link. */
function card(item: Element): Element | null {
  const link = children(item, "a")[0];
  if (!link) return null;
  const description = item.children.filter((child) => child !== link).map(textOf).join("").replace(/^\s*:\s*/, "").trim();
  return el("li", undefined, [
    el("a", "related-card", [el("span", "related-title", link.children), ...(description ? [el("span", "related-text", [text(description)])] : [])], { href: link.properties?.href }),
  ]);
}

/**
 * Page-level enhancements on top of plain markdown: key names in the keyboard table render as keys,
 * and the Related list renders as cards. Both key off the section heading that precedes them.
 */
export function rehypeDocs() {
  return (tree: Root) => {
    let section = "";
    for (const node of tree.children) {
      if (node.type !== "element") continue;
      if (node.tagName === "h2") section = String(node.properties?.id ?? "");
      if (node.tagName === "table" && section === "keyboard-interactions") {
        node.properties = { ...node.properties, className: ["keys-table"] };
        for (const body of children(node, "tbody")) {
          for (const row of children(body, "tr")) {
            const cell = children(row, "td")[0];
            if (cell) cell.children = keys(cell.children.map(textOf).join(""));
          }
        }
      }
      if (node.tagName === "ul" && section === "related") {
        const cards = children(node, "li").map(card);
        if (cards.every(Boolean)) {
          node.properties = { ...node.properties, className: ["related-grid"] };
          node.children = cards as Element[];
        }
      }
    }
  };
}
