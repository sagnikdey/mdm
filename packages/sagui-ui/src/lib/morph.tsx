import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { duration, spring, stagger } from "@sagui/tokens/motion";
import { easeEnter, fadeIn, fadeOut, glyphIn, glyphOut, rest } from "./motion";

/** Names an icon element, so swapping Copy for Check morphs while a re-render of the same icon stays still. */
export function iconKey(node: React.ReactNode): string {
  if (!React.isValidElement(node)) return node == null || typeof node === "boolean" ? "" : String(node);
  const type = node.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? type : type?.displayName ?? type?.name ?? "icon";
}

/**
 * Springs the content's parent slot to the natural width of the content when `key` changes.
 * Other resizes (a late web font, a parent reflow) jump straight to the new width, so nothing wobbles on first paint.
 */
export function useMorphWidth(content: React.RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = React.useRef(key);
  const armedUntil = React.useRef(0);
  React.useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);
  React.useEffect(() => {
    const node = content.current;
    const slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) {
        measured = next > 0;
        width.jump(next || "auto");
        delete slot.dataset.morphing;
        return;
      }
      slot.dataset.morphing = "";
      animate(width, next, { ...spring.morph, onComplete: () => { delete slot.dataset.morphing; } });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);
  return width;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Shared leading and trailing characters keep their identity, so "Copy" to "Copied" only replaces the changed letters. */
export function useGlyphs(text: string) {
  const [state, setState] = React.useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }));
  if (state.text === text) return state.glyphs;
  const prev = [...state.text];
  const next = [...text];
  let start = 0;
  let end = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++;
  if (start < 2) start = 0;
  if (end < 2) end = 0;
  const seq = state.seq + 1;
  const glyphs = [
    ...state.glyphs.slice(0, start),
    ...toGlyphs(next.slice(start, next.length - end), seq),
    ...state.glyphs.slice(state.glyphs.length - end),
  ];
  setState({ text, seq, glyphs });
  return glyphs;
}

/** Morphs one label into the next: kept letters glide into place and new ones rise in from a soft blur. */
export function MorphText({ text, reduced, calm = false, layoutRoot = false }: { text: string; reduced: boolean; calm?: boolean; layoutRoot?: boolean }) {
  const glyphs = useGlyphs(text);
  const enter = calm
    ? { duration: 0.36, ease: easeEnter }
    : { duration: duration.standard, ease: easeEnter };
  return (
    <motion.span className="relative inline-flex flex-none whitespace-pre" layoutRoot={layoutRoot}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map((glyph) => (
          <motion.span
            key={glyph.id}
            className="inline-block"
            layout={reduced ? false : "position"}
            layoutDependency={text}
            initial={reduced ? fadeIn : glyphIn}
            animate={rest}
            exit={reduced ? fadeOut : glyphOut}
            transition={
              reduced
                ? { duration: duration.instant }
                : { ...enter, delay: Math.min(glyph.order * (calm ? 0.02 : stagger.char), calm ? 0.12 : 0.1), layout: calm ? spring.settle : spring.morph }
            }
          >
            {glyph.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.span>
  );
}
