import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps, MotionProps, Transition, Variants } from "motion/react";
import { X } from "lucide-react";
import { blur, duration, ease, spring, stagger } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { easeEnter, easeStandard } from "../../lib/motion";

const s = {
  // Isolation keeps the rounded clip on the media while the card lifts on its own layer (Safari drops it otherwise).
  // Motion drives the lift and the quick look morph, so transform never gets a CSS transition here.
  card: "relative isolate min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface text-foreground transition-[border-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] data-[hover]:border-border-strong data-[hover]:shadow-raised has-[[data-trigger]:focus-visible]:border-border-strong has-[[data-trigger]:focus-visible]:ring-2 has-[[data-trigger]:focus-visible]:ring-ring motion-reduce:transition-none",
  media: "relative overflow-hidden bg-muted",
  zoom: "grid min-h-28 place-items-center",
  content: "p-5",
  // Fit-content width keeps the title's box the shape of its text, so it scales evenly when it grows into the quick look.
  title: "m-0 w-fit max-w-full text-lg font-medium leading-[1.3] tracking-[-0.01em] [text-wrap:balance]",
  // The title's hit area stretches over the whole card, so pointing anywhere opens the quick look while the action stays on top.
  trigger: "cursor-pointer border-0 bg-none p-0 text-left text-[length:inherit] [font:inherit] [letter-spacing:inherit] text-inherit [-webkit-tap-highlight-color:transparent] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
  description: "mt-2 max-w-[34ch] text-sm leading-snug text-muted-foreground [text-wrap:pretty]",
  footer: "mt-5 flex items-center justify-between gap-3",
  byline: "flex min-w-0 flex-auto items-center gap-3",
  avatar: "grid size-8 flex-none overflow-hidden rounded-full bg-muted [&>*]:size-full [&>*]:object-cover",
  // A shrinkable column, so a narrow footer truncates the byline instead of sliding it under the action.
  bylineText: "grid min-w-0 grid-cols-[minmax(0,1fr)] text-xs leading-snug",
  meta: "truncate font-medium text-foreground",
  status: "relative whitespace-nowrap text-muted-foreground tabular-nums [overflow:clip_visible]",
  roll: "relative block",
  line: "block text-ellipsis [overflow:clip_visible]",
  word: "inline-block whitespace-pre",
  srOnly: "sr-only",
  action: "relative z-1 flex flex-none flex-wrap gap-3",
  overlay: "fixed inset-0 z-50 bg-[oklch(10%_0_0/.46)] backdrop-blur-[7px] data-[state=closed]:!pointer-events-none",
  // Centered with auto margins, so transform stays free for the morph. Closing: the panel takes the card's box and look, so it lands exactly where the card sits and hands back without a seam.
  panel: cn(
    "fixed inset-0 z-51 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),30rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[var(--radius-xl)] border border-border bg-surface text-foreground shadow-floating focus:outline-none",
    "transition-[background-color,box-shadow] duration-[var(--duration-standard)] ease-[var(--ease-out-quint)]",
    "[&_.sg-content]:p-6 [&_h2]:text-xl [&_.sg-desc]:max-w-[var(--card-measure,34ch)]",
    "data-[returning]:pointer-events-none data-[returning]:inset-auto data-[returning]:top-[var(--landing-top)] data-[returning]:left-[var(--landing-left)] data-[returning]:m-0 data-[returning]:h-[var(--landing-height)] data-[returning]:max-h-none data-[returning]:w-[var(--landing-width)] data-[returning]:overflow-hidden data-[returning]:border-border data-[returning]:shadow-none",
    "data-[returning]:[&_.sg-content]:p-5 data-[returning]:[&_h2]:text-lg"
  ),
  // The slot carries the entrance, so the button's own press answers instantly.
  closeSlot: "absolute top-4 right-4 z-2 grid",
  close: "grid size-8 cursor-pointer place-items-center rounded-full border border-border/70 bg-surface/75 p-0 text-foreground backdrop-blur-[12px] transition-colors duration-[var(--duration-quick)] [-webkit-tap-highlight-color:transparent] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
  details: "mt-6 border-t border-border pt-5 text-sm leading-snug text-muted-foreground",
};


export interface CardProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  media?: ReactNode;
  action?: ReactNode;
  /** A small leading visual for the footer, such as the owner's avatar. */
  avatar?: ReactNode;
  /** Who the card belongs to, such as the owner's name. */
  meta?: ReactNode;
  /** A short status under the meta, such as "Updated 2 hours ago". Changed words rise in and are announced politely. */
  status?: string;
  /** Content for a quick look. When set, the whole card opens and grows into a larger view; Escape or the close control morphs it back. */
  details?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Side = "card" | "panel";
type Geometry = { card?: number; panel?: number; measure?: number };
type Landing = { top: number; left: number; width: number; height: number };

/** One critically damped spring carries the surface both ways, so it never overshoots and can reverse mid-flight. Closing is a touch quicker. */
const grow: Transition = { ...spring.smooth, visualDuration: .3 };
const settle: Transition = { ...spring.smooth, visualDuration: .26 };
const RETURN_MS = 300;
const fade: Transition = { duration: duration.instant };
/** The photo drifts in slowly while the card is pointed at, and eases back a little faster. */
const ZOOM = 1.04;
const zoomIn: Transition = { duration: duration.considered * 2, ease: easeStandard };
const zoomOut: Transition = { duration: duration.considered, ease: easeStandard };
/** Quick look extras arrive once the surface has mostly grown, so they never ride the stretch. */
const reveal: Transition = { delay: duration.instant, duration: duration.standard, ease: easeEnter };
const closeIn: Transition = { delay: duration.instant, duration: duration.quick, ease: easeEnter };

/** A new status replaces the whole line: the old one lifts away quickly while the new words rise in one after another. */
const lineMotion: Variants = {
  enter: {},
  center: {},
  exit: { opacity: 0, y: "-.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: duration.quick, ease: easeStandard } },
};
const wordMotion: Variants = {
  enter: { opacity: 0, y: ".3em", filter: `blur(${blur.soft}px)` },
  center: (order: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: easeEnter, delay: order * stagger.word } }),
};

function Status({ text, reduced }: { text: string; reduced: boolean }) {
  return <span className={s.status} role="status">
    <span className={s.srOnly}>{text}</span>
    <span className={s.roll} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={text} className={s.line} variants={lineMotion} initial={reduced ? false : "enter"} animate="center" exit={reduced ? undefined : "exit"}>
        {text.split(/(\s+)/).map((part, index) => <motion.span key={index} className={s.word} custom={index / 2} variants={wordMotion}>{part}</motion.span>)}
      </motion.span>
    </AnimatePresence></span>
  </span>;
}

/** Motion only scale-corrects pixel radii, so token radii are read back in pixels for the morph. */
function px(node: Element, value: string) {
  const amount = parseFloat(value);
  if (!Number.isFinite(amount)) return undefined;
  return value.trim().endsWith("rem") ? amount * parseFloat(getComputedStyle(node.ownerDocument.documentElement).fontSize) : amount;
}

/** A contained group of related content and actions. With `details`, the whole card opens and grows into a larger quick look. */
export function Card({ title, description, media, action, avatar, meta, status, details, open: openProp, defaultOpen = false, onOpenChange, children, className, style, ...props }: CardProps) {
  const reduced = useReducedMotion() ?? false;
  const group = useId();
  const cardRef = useRef<HTMLElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const [geometry, setGeometry] = useState<Geometry>({});
  /** Where the quick look lands when it closes: the card's box on screen. The panel travels there above the page, then hands back to the card. */
  const [landing, setLanding] = useState<Landing | null>(null);
  const open = details ? openProp ?? uncontrolled : false;
  const morph = Boolean(details) && !reduced;
  const returning = !open && landing !== null;
  const hasDescription = Boolean(description);
  const setOpen = useCallback((next: boolean) => { if (openProp === undefined) setUncontrolled(next); onOpenChange?.(next); }, [openProp, onOpenChange]);

  // The quick look keeps the card's line length, so the description never rewraps while it travels.
  useEffect(() => {
    const node = cardRef.current, text = descriptionRef.current;
    if (!morph || !node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const computed = getComputedStyle(node);
      const radius = px(node, computed.borderTopLeftRadius), surface = px(node, computed.getPropertyValue("--radius-xl")), measure = text?.offsetWidth || undefined;
      setGeometry(current => current.card !== undefined && current.measure === measure ? current : { card: current.card ?? radius, panel: current.panel ?? surface, measure });
    });
    observer.observe(node);
    if (text) observer.observe(text);
    return () => observer.disconnect();
  }, [morph, hasDescription]);

  // Closing keeps the quick look mounted and sends it back to the card's box, so the surface never drops behind the page or a clipped preview.
  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    const closed = wasOpen.current && !open;
    wasOpen.current = open;
    const node = cardRef.current;
    if (open) setLanding(null); // eslint-disable-line react-hooks/set-state-in-effect -- reopening mid-return cancels the landing
    else if (closed && morph && node) {
      const box = node.getBoundingClientRect();
      setLanding({ top: box.top, left: box.left, width: box.width, height: box.height });
    }
  }, [open, morph]);
  // Once the surface has visually landed, the card takes over. Any last sub-pixel of travel carries on in the card itself, so the handoff has no seam.
  useEffect(() => {
    if (!returning) return;
    const timer = window.setTimeout(() => setLanding(null), RETURN_MS);
    return () => window.clearTimeout(timer);
  }, [returning]);

  /** The same pieces live in the card and in the quick look; a shared id lets each one travel between them.
      Crossfade is off: the arriving piece takes over at full opacity and the other hides, so one solid surface moves instead of two translucent copies. */
  const shared = (id: string, side: Side, layout: true | "position" = true): MotionProps => morph ? { layoutId: id, layout, layoutDependency: side === "card" ? open : returning ? "return" : "panel", transition: { layout: side === "card" ? settle : grow } } : {};

  const footer = (side: Side) => avatar || meta || status || action ? <div className={s.footer}>
    {avatar || meta || status ? <motion.div className={s.byline} {...shared("byline", side, "position")}>
      {avatar ? <span className={s.avatar}>{avatar}</span> : null}
      <span className={s.bylineText}>{meta ? <span className={s.meta}>{meta}</span> : null}{status ? <Status text={status} reduced={reduced} /> : null}</span>
    </motion.div> : null}
    {action ? <motion.div className={s.action} {...shared("action", side, "position")}>{action}</motion.div> : null}
  </div> : null;

  const card = <motion.article
    {...(props as HTMLMotionProps<"article">)}
    ref={cardRef}
    className={[s.card, className].filter(Boolean).join(" ")}
    style={{ ...style, borderRadius: geometry.card ?? style?.borderRadius }}
    data-hover={hovered || undefined}
    whileHover={reduced ? undefined : { y: -2 }}
    onHoverStart={() => setHovered(true)}
    onHoverEnd={() => setHovered(false)}
    {...shared("card", "card")}
    transition={{ default: spring.snappy, layout: settle }}
  >
    {media ? <motion.div className={s.media} {...shared("media", "card")}><motion.div className={s.zoom} initial={false} animate={{ scale: hovered && !reduced ? ZOOM : 1 }} transition={hovered ? zoomIn : zoomOut}>{media}</motion.div></motion.div> : null}
    <div className={s.content}>
      <motion.h3 className={s.title} {...shared("title", "card")}>{details ? <DialogPrimitive.Trigger asChild><button type="button" className={s.trigger}>{title}</button></DialogPrimitive.Trigger> : title}</motion.h3>
      {description ? <motion.p ref={descriptionRef} className={s.description} {...shared("description", "card", "position")}>{description}</motion.p> : null}
      {children}
      {footer("card")}
    </div>
  </motion.article>;

  if (!details) return card;

  // The quick look grows out of the card: the surface, photo, and copy travel on one spring while the details settle in beneath them.
  return <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
    <LayoutGroup id={group}>
      {card}
      <AnimatePresence>
        {(open || returning) && <DialogPrimitive.Portal key="quick-look" forceMount>
          <AnimatePresence>{open && <DialogPrimitive.Overlay key="overlay" asChild forceMount><motion.div className={s.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: reduced ? fade : { duration: 0.18, ease: easeStandard } }} transition={reduced ? fade : { duration: duration.standard, ease: easeEnter }} /></DialogPrimitive.Overlay>}</AnimatePresence>
          <DialogPrimitive.Content asChild forceMount {...(description ? {} : { "aria-describedby": undefined })}>
            <motion.div
              className={s.panel}
              data-framer-portal-id={group}
              data-returning={returning || undefined}
              layoutScroll
              style={{ borderRadius: geometry.panel, "--card-measure": geometry.measure ? `${geometry.measure}px` : undefined, ...(landing && returning ? { "--landing-top": `${landing.top}px`, "--landing-left": `${landing.left}px`, "--landing-width": `${landing.width}px`, "--landing-height": `${landing.height}px` } : {}) } as CSSProperties}
              {...(morph ? {
                ...shared("card", "panel"),
                initial: false,
                animate: geometry.card !== undefined && geometry.panel !== undefined ? { borderRadius: returning ? geometry.card : geometry.panel } : undefined,
                transition: { layout: returning ? settle : grow, borderRadius: returning ? settle : grow },
                exit: { opacity: 0, transition: { duration: 0 } },
              } : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: fade }, transition: fade })}
            >
              {media ? <motion.div className={s.media} {...shared("media", "panel")}><motion.div className={s.zoom} initial={{ scale: hovered && !reduced ? ZOOM : 1 }} animate={{ scale: 1 }} transition={grow}>{media}</motion.div></motion.div> : null}
              <motion.span className={s.closeSlot} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .9 }} animate={returning ? { opacity: 0, scale: .9 } : { opacity: 1, scale: 1 }} transition={returning ? fade : reduced ? fade : closeIn}><DialogPrimitive.Close asChild><motion.button type="button" className={s.close} aria-label="Close quick look" whileTap={reduced ? undefined : { scale: .94 }} transition={spring.snappy}><X width={16} height={16} strokeWidth={1.75} aria-hidden="true" /></motion.button></DialogPrimitive.Close></motion.span>
              <div className={cn(s.content, "sg-content")}>
                <DialogPrimitive.Title asChild><motion.h2 className={s.title} {...shared("title", "panel")}>{title}</motion.h2></DialogPrimitive.Title>
                {description ? <DialogPrimitive.Description asChild><motion.p className={cn(s.description, "sg-desc")} {...shared("description", "panel", "position")}>{description}</motion.p></DialogPrimitive.Description> : null}
                {children}
                {footer("panel")}
                <motion.div className={s.details} initial={reduced ? false : { opacity: 0, y: 6 }} animate={returning ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }} exit={{ opacity: 0, transition: fade }} transition={returning || reduced ? fade : reveal}>{details}</motion.div>
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>}
      </AnimatePresence>
    </LayoutGroup>
  </DialogPrimitive.Root>;
}
