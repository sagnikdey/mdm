import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { Variants } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { blur, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, fieldLabel } from "../../lib/field";
import { easeEnter, easeStandard, physical } from "../../lib/motion";
import { useReducedFlag } from "../../lib/use-reduced";
import {
  BY_ISO, PHONE_COUNTRIES, capDigits, flagOf, formatNational, lengthsOf, onlyDigits, parsePhoneNumber, splitTrunk, statusOf, toE164,
  type PhoneCountry, type PhoneStatus,
} from "./countries";

export interface PhoneInputDetails {
  country: PhoneCountry;
  /** The number as shown in the field, without the calling code. */
  formatted: string;
  status: PhoneStatus;
  valid: boolean;
}

export interface PhoneInputProps {
  label: string;
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean;
  /** The number in E.164, such as "+14155550132". An empty string clears the field. */
  value?: string;
  defaultValue?: string;
  /** Fires on every edit with the E.164 number (empty when there are no digits) and its parsed details. */
  onValueChange?: (value: string, details: PhoneInputDetails) => void;
  /** ISO code of the selected country. */
  country?: string;
  /** ISO code used until someone picks a country or enters an international number. */
  defaultCountry?: string;
  onCountryChange?: (iso: string) => void;
  /** Limit the picker to these ISO codes. */
  countries?: string[];
  /** Pinned at the top of the picker under "Suggested". */
  preferredCountries?: string[];
  description?: string;
  /** Replaces the built-in validation message. */
  error?: string;
  /** Show a message after blur when the number is incomplete. On by default. */
  validate?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Adds a hidden input carrying the E.164 value for native form submission. */
  name?: string;
  id?: string;
  className?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const GROW = physical(0.4, 0.12), SHRINK = physical(0.32, 0), GLIDE = physical(0.28, 0.08), WIDTH = physical(0.42, 0.16);
const PANEL_MAX = 340, CLOSED_RADIUS = 9, OPEN_RADIUS = 16, PAGE = 8;

/** The flag and calling code roll in the direction of the list: a country further down rises from below. */
const layerVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: `${dir * 0.6}em`, filter: `blur(${blur.soft}px)` }),
  rest: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  exit: (dir: number) => ({ opacity: 0, y: `${dir * -0.5}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: 0.12, ease: easeStandard } }),
};
const layerFade: Variants = { enter: { opacity: 0 }, rest: { opacity: 1, y: 0, filter: "none" }, exit: { opacity: 0, transition: { duration: 0.08 } } };

function matchesQuery(entry: PhoneCountry, needle: string) {
  if (!needle) return true;
  const digits = onlyDigits(needle);
  if (digits && /^[+\d\s()-]+$/.test(needle)) return entry.dial.startsWith(digits) || digits.startsWith(entry.dial);
  if (needle.replace("+", "") === "") return true;
  return entry.name.toLowerCase().includes(needle) || entry.iso.toLowerCase() === needle;
}

/** Position in the formatted text just after the nth digit. */
function caretAfterDigits(text: string, count: number) {
  if (count <= 0) { const first = text.search(/\d/); return first < 0 ? text.length : Math.min(first, text.length); }
  let seen = 0;
  for (let index = 0; index < text.length; index++) if (/\d/.test(text[index]) && ++seen === count) return index + 1;
  return text.length;
}

type Row = { key: string; entry: PhoneCountry };
type Section = { key: string; label?: string; rows: Row[] };

const flagFont = "[font-family:'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',var(--font-sans)]";
const triggerBase = "box-border flex h-[calc(var(--pi-h)-2px)] items-center pr-9 pl-3 text-sm font-medium whitespace-nowrap";

/**
 * A phone number field with a country picker. The country button grows into a searchable list, the number formats as it is
 * typed with a faint guide showing the rest of the expected shape, pasted or autofilled international numbers pick their own
 * country, and the value comes out in E.164. Typing "+" in the number jumps into the picker with a calling code search.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput({
  label, hideLabel = false, value, defaultValue, onValueChange, country: countryProp, defaultCountry = "US", onCountryChange, countries,
  preferredCountries = ["US", "CA", "GB"], description, error, validate = true, disabled = false, required, name, id, className, onBlur,
}, forwardedRef) {
  const reduced = useReducedFlag();
  const uid = React.useId();
  const inputId = id ?? `${uid}-number`;
  const listId = `${uid}-list`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const optionId = (key: string) => `${uid}-opt-${key}`;

  const pool = React.useMemo(() => (countries?.length ? PHONE_COUNTRIES.filter((entry) => countries.includes(entry.iso)) : PHONE_COUNTRIES), [countries]);
  const fallback = BY_ISO.get(defaultCountry) ?? PHONE_COUNTRIES[0];

  const [state, setState] = React.useState(() => {
    const parsed = parsePhoneNumber(value ?? defaultValue ?? "", pool);
    return parsed ? { iso: parsed.country.iso, digits: parsed.national } : { iso: fallback.iso, digits: "" };
  });
  const iso = countryProp ?? state.iso;
  const current = BY_ISO.get(iso) ?? fallback;
  const digits = state.digits;
  const e164 = toE164(current, digits);

  // A controlled value that differs from what the field last produced is read back in.
  const [seenValue, setSeenValue] = React.useState(value);
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== undefined && value !== e164) {
      const parsed = parsePhoneNumber(value, pool);
      setState(parsed ? { iso: parsed.country.iso, digits: parsed.national } : { iso, digits: "" });
    }
  }

  const formatted = formatNational(current, digits);
  const status = statusOf(current, digits);
  const [touched, setTouched] = React.useState(false);
  const lengths = lengthsOf(current);
  const lengthCopy = lengths.length === 1 ? `${lengths[0]}` : `${lengths.slice(0, -1).join(", ")} or ${lengths[lengths.length - 1]}`;
  const builtIn = validate && touched && (status === "incomplete" || status === "too-long") ? `Numbers in ${current.name} have ${lengthCopy} digits` : undefined;
  const message = error ?? builtIn;

  /* The guide: the rest of the example number, in the shape this country expects, drawn faintly after what was typed. */
  const guide = React.useMemo(() => {
    const [trunk, rest] = splitTrunk(current, digits);
    if (rest.length >= current.example.length) return "";
    const full = formatNational(current, trunk + rest + current.example.slice(rest.length));
    return full.startsWith(formatted) ? full.slice(formatted.length) : "";
  }, [current, digits, formatted]);

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);
  const pendingCaret = React.useRef<number | null>(null);
  const [, rerender] = React.useReducer((count: number) => count + 1, 0);

  const emit = React.useCallback((entry: PhoneCountry, nextDigits: string) => {
    const nextStatus = statusOf(entry, nextDigits);
    onValueChange?.(toE164(entry, nextDigits), { country: entry, formatted: formatNational(entry, nextDigits), status: nextStatus, valid: nextStatus === "valid" });
  }, [onValueChange]);

  const setNumber = (nextDigits: string, caretDigits: number | null, entry = current) => {
    const capped = capDigits(entry, nextDigits);
    pendingCaret.current = caretDigits === null ? null : Math.min(caretDigits, capped.length);
    if (entry.iso !== current.iso) onCountryChange?.(entry.iso);
    // Nothing changed (a refused digit): React restores the old text after this handler, so the caret is placed on the next render.
    if (capped === digits && entry.iso === current.iso) { rerender(); return; }
    setState({ iso: entry.iso, digits: capped });
    emit(entry, capped);
  };

  function placeCaret() {
    const input = inputRef.current;
    const count = pendingCaret.current;
    pendingCaret.current = null;
    if (!input || count === null || document.activeElement !== input) return;
    const position = caretAfterDigits(input.value, count);
    input.setSelectionRange(position, position);
  }
  React.useLayoutEffect(placeCaret);

  const [announcement, setAnnouncement] = React.useState("");

  /* ---------------------------------------------- Number entry ---------------------------------------------- */

  function onNumberChange(input: HTMLInputElement) {
    const raw = input.value;
    // Autofill and dropped text arrive as a change: an international number chooses its own country.
    if (raw.includes("+") || (/^\s*00/.test(raw) && onlyDigits(raw).length > 6)) {
      const parsed = parsePhoneNumber(raw.slice(Math.max(0, raw.indexOf("+"))), pool);
      if (parsed && parsed.national) {
        if (parsed.country.iso !== current.iso) setAnnouncement(`Country set to ${parsed.country.name}`);
        setNumber(parsed.national, parsed.national.length, parsed.country);
        return;
      }
    }
    const caret = input.selectionStart ?? raw.length;
    setNumber(onlyDigits(raw), onlyDigits(raw.slice(0, caret)).length);
  }

  function onNumberKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (event.key === "+" && !event.metaKey && !event.ctrlKey) { event.preventDefault(); openList("+"); return; }
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start !== end || event.metaKey || event.ctrlKey || event.altKey) return;
    // Deleting a separator deletes the digit beside it instead of doing nothing.
    if (event.key === "Backspace" && start > 0 && !/\d/.test(input.value[start - 1])) {
      event.preventDefault();
      const index = onlyDigits(input.value.slice(0, start)).length;
      if (index > 0) setNumber(digits.slice(0, index - 1) + digits.slice(index), index - 1);
    }
    if (event.key === "Delete" && start < input.value.length && !/\d/.test(input.value[start])) {
      event.preventDefault();
      const index = onlyDigits(input.value.slice(0, start)).length;
      setNumber(digits.slice(0, index) + digits.slice(index + 1), index);
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!text) return;
    event.preventDefault();
    const input = event.currentTarget;
    const parsed = /^\s*(\+|00)/.test(text) ? parsePhoneNumber(text, pool) : null;
    if (parsed) {
      if (parsed.country.iso !== current.iso) setAnnouncement(`Country set to ${parsed.country.name}`);
      setNumber(parsed.national, parsed.national.length, parsed.country);
      return;
    }
    let pasted = onlyDigits(text);
    // "1 415 555 0132" pasted into a US field: the leading calling code is dropped when the number would not fit otherwise.
    if (pasted.startsWith(current.dial) && pasted.length > capDigits(current, pasted).length) pasted = pasted.slice(current.dial.length);
    // A whole number replaces what was there; a fragment goes in at the caret.
    if (pasted.length >= Math.min(...lengthsOf(current))) { setNumber(pasted, pasted.length); return; }
    const a = onlyDigits(input.value.slice(0, input.selectionStart ?? 0)).length;
    const b = onlyDigits(input.value.slice(0, input.selectionEnd ?? 0)).length;
    setNumber(digits.slice(0, a) + pasted + digits.slice(b), a + pasted.length);
  }

  /* ---------------------------------------------- Country picker ---------------------------------------------- */

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<string | null>(null);
  const [roll, setRoll] = React.useState(1);
  const needle = query.trim().toLowerCase();

  const sections = React.useMemo<Section[]>(() => {
    const sorted = [...pool].sort((a, b) => a.name.localeCompare(b.name));
    if (needle && needle !== "+") {
      const hits = sorted.filter((entry) => matchesQuery(entry, needle));
      const digitsOnly = onlyDigits(needle);
      if (digitsOnly) hits.sort((a, b) => Number(b.dial === digitsOnly) - Number(a.dial === digitsOnly) || a.dial.length - b.dial.length);
      return [{ key: "results", rows: hits.map((entry) => ({ key: `r-${entry.iso}`, entry })) }];
    }
    const preferred = preferredCountries.map((code) => pool.find((entry) => entry.iso === code)).filter((entry): entry is PhoneCountry => !!entry);
    const all = { key: "all", label: preferred.length ? "All countries" : undefined, rows: sorted.map((entry) => ({ key: `a-${entry.iso}`, entry })) };
    return preferred.length ? [{ key: "preferred", label: "Suggested", rows: preferred.map((entry) => ({ key: `p-${entry.iso}`, entry })) }, all] : [all];
  }, [needle, pool, preferredCountries]);
  const rows = React.useMemo(() => sections.flatMap((section) => section.rows), [sections]);
  const activeKey = active !== null && rows.some((row) => row.key === active) ? active : rows[0]?.key ?? null;
  const orderOf = React.useMemo(() => new Map([...pool].sort((a, b) => a.name.localeCompare(b.name)).map((entry, index) => [entry.iso, index])), [pool]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const controlRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const listFaceRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const rowRefs = React.useRef(new Map<string, HTMLElement>());

  /* One surface whose width, height, and corners spring between the country button and the open list. */
  const anchorW = useMotionValue<number | string>("auto");
  const shapeW = useMotionValue<number | string>("100%");
  const shapeH = useMotionValue<number | string>("100%");
  const radius = useMotionValue(CLOSED_RADIUS);
  const sizes = React.useRef({ trigger: 0, lid: 0, panel: 0, list: 0 });
  const live = React.useRef({ open: false, reduced: false, measured: false });
  React.useLayoutEffect(() => { live.current.reduced = reduced; }, [reduced]);

  const place = React.useCallback((animated: boolean) => {
    const { trigger, lid, panel, list } = sizes.current;
    if (!trigger || !lid) return;
    const isOpen = live.current.open;
    const next = isOpen ? { w: Math.max(trigger, panel), h: lid + 2 + list, r: OPEN_RADIUS } : { w: trigger, h: lid, r: CLOSED_RADIUS };
    if (!animated || live.current.reduced || !live.current.measured) {
      anchorW.jump(trigger); shapeW.jump(next.w); shapeH.jump(next.h); radius.jump(next.r);
      live.current.measured = true;
      return;
    }
    const growing = isOpen;
    animate(anchorW, trigger, WIDTH);
    animate(shapeW as never, next.w, growing ? GROW : SHRINK);
    animate(shapeH as never, next.h, growing ? GROW : SHRINK);
    animate(radius, next.r, growing ? GROW : SHRINK);
  }, [anchorW, radius, shapeH, shapeW]);

  const read = React.useCallback(() => {
    const measure = measureRef.current;
    const control = controlRef.current;
    const face = listFaceRef.current;
    const root = rootRef.current;
    if (!measure || !control || !face || !root) return false;
    const panel = Math.min(PANEL_MAX, control.offsetWidth);
    root.style.setProperty("--pi-panel-w", `${panel}px`);
    const previous = sizes.current;
    const next = { trigger: measure.offsetWidth, lid: control.clientHeight, panel, list: face.offsetHeight };
    sizes.current = next;
    return next.trigger !== previous.trigger || next.lid !== previous.lid || next.panel !== previous.panel || (live.current.open && next.list !== previous.list);
  }, []);

  React.useLayoutEffect(() => {
    const measure = measureRef.current;
    const control = controlRef.current;
    const face = listFaceRef.current;
    if (read()) place(live.current.measured);
    if (!measure || !control || !face || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { if (read()) place(live.current.measured); });
    observer.observe(measure); observer.observe(control); observer.observe(face);
    return () => observer.disconnect();
  }, [place, read]);

  const pendingFocus = React.useRef<"trigger" | "search" | "number" | null>(null);
  React.useLayoutEffect(() => {
    if (live.current.open !== open) { live.current.open = open; read(); place(true); }
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === "search") searchRef.current?.focus({ preventScroll: true });
    if (target === "trigger") triggerRef.current?.focus({ preventScroll: true });
    if (target === "number") { const input = inputRef.current; input?.focus({ preventScroll: true }); input?.setSelectionRange(input.value.length, input.value.length); }
  }, [open, place, read]);

  /* The highlight glides between rows on its own spring. */
  const hy = useMotionValue(0), hh = useMotionValue(0), ho = useMotionValue(0);
  const scrollIntent = React.useRef(false);
  React.useLayoutEffect(() => {
    const node = open && activeKey ? rowRefs.current.get(activeKey) : undefined;
    if (!node) { animate(ho, 0, { duration: reduced || !open ? 0 : 0.12, ease: easeStandard }); return; }
    const top = node.offsetTop;
    const height = node.offsetHeight;
    if (ho.get() < 0.05 || reduced) { hy.jump(top); hh.jump(height); }
    else { animate(hy, top, GLIDE); animate(hh, height, GLIDE); }
    animate(ho, 1, { duration: reduced ? 0 : 0.12, ease: easeEnter });
    const scroller = scrollRef.current;
    if (scroller && scrollIntent.current) {
      scrollIntent.current = false;
      const pad = 6;
      if (top < scroller.scrollTop + pad) scroller.scrollTop = top - pad;
      else if (top + height > scroller.scrollTop + scroller.clientHeight - pad) scroller.scrollTop = top + height - scroller.clientHeight + pad;
    }
  }, [activeKey, hh, ho, hy, open, reduced, sections]);

  function openList(seed = "") {
    if (disabled || open) return;
    setQuery(seed);
    const selectedRow = seed ? null : sections.flatMap((section) => section.rows).find((row) => row.entry.iso === current.iso && !row.key.startsWith("p-")) ?? null;
    setActive(selectedRow?.key ?? null);
    scrollIntent.current = true;
    pendingFocus.current = "search";
    setAnnouncement("");
    setOpen(true);
  }
  const close = React.useCallback((focus: "trigger" | "number" | null) => {
    pendingFocus.current = focus;
    setOpen(false);
  }, [setOpen]);

  function pick(entry: PhoneCountry | undefined) {
    if (!entry) return;
    if (entry.iso !== current.iso) {
      setRoll(Math.sign((orderOf.get(entry.iso) ?? 0) - (orderOf.get(current.iso) ?? 0)) || 1);
      const nextDigits = capDigits(entry, digits);
      if (countryProp === undefined) setState({ iso: entry.iso, digits: nextDigits });
      else setState((last) => ({ ...last, digits: nextDigits }));
      onCountryChange?.(entry.iso);
      emit(entry, nextDigits);
      setAnnouncement(`${entry.name}, +${entry.dial}`);
    }
    close("number");
  }

  function move(key: string | null | undefined) {
    if (!key) return;
    scrollIntent.current = true;
    setActive(key);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const at = rows.findIndex((row) => row.key === activeKey);
    switch (event.key) {
      case "ArrowDown": event.preventDefault(); move(rows[Math.min(rows.length - 1, at + 1)]?.key); return;
      case "ArrowUp": event.preventDefault(); move(rows[Math.max(0, at - 1)]?.key); return;
      case "PageDown": event.preventDefault(); move(rows[Math.min(rows.length - 1, at + PAGE)]?.key); return;
      case "PageUp": event.preventDefault(); move(rows[Math.max(0, at - PAGE)]?.key); return;
      case "Home": if (query) return; event.preventDefault(); move(rows[0]?.key); return;
      case "End": if (query) return; event.preventDefault(); move(rows[rows.length - 1]?.key); return;
      case "Enter": event.preventDefault(); pick(rows[at]?.entry); return;
      case "Escape": event.preventDefault(); event.stopPropagation(); close("trigger"); return;
      case "Tab": close(null); return;
    }
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openList(); return; }
    if (event.key.length === 1 && event.key !== " " && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); openList(event.key); }
  }

  function onQuery(next: string) {
    setQuery(next);
    setActive(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const text = next.trim().toLowerCase();
    const count = text && text !== "+" ? pool.filter((entry) => matchesQuery(entry, text)).length : pool.length;
    setAnnouncement(text ? (count ? `${count} ${count === 1 ? "country" : "countries"}` : "No matches") : "");
  }

  React.useEffect(() => {
    if (!open) return;
    const down = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) close(null); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [close, open]);

  const onRootBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) close(null);
  };

  const showCheck = status === "valid";
  const invalid = !!message;
  const describedBy = [description ? hintId : null, message ? errorId : null].filter(Boolean).join(" ") || undefined;

  const face = (entry: PhoneCountry) => (
    <>
      <span className={cn("inline-grid w-5 flex-none place-items-center text-[17px] font-normal leading-none", flagFont)} aria-hidden="true">{flagOf(entry.iso)}</span>
      <span className="tabular-nums">+{entry.dial}</span>
    </>
  );

  return (
    // No row gap: grid tracks clamp a negative margin at zero, so a closed message row would still pay the gap.
    <div
      ref={rootRef}
      className={cn("group/pi relative grid min-w-0 [--pi-h:40px] [--pi-panel-w:320px] data-[open]:z-30", className)}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
      onBlur={onRootBlur}
    >
      <label htmlFor={inputId} className={hideLabel ? "sr-only" : cn(fieldLabel, "justify-self-start")}>{label}</label>

      {/* The shell matches the labeled input: one border, one radius, and a quiet border change on hover and focus. */}
      <div
        ref={controlRef}
        className={cn(
          "relative box-border flex h-[var(--pi-h)] min-w-0 rounded-[var(--radius-md)] border bg-surface",
          "transition-[border-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          "has-[[data-number]:focus]:border-ring has-[[data-number]:focus]:ring-[3px] has-[[data-number]:focus]:ring-ring/25",
          invalid ? "border-destructive has-[[data-number]:focus]:border-destructive has-[[data-number]:focus]:ring-destructive/25" : "border-border-strong [@media(hover:hover)_and_(pointer:fine)]:hover:not-has-[[data-number]:focus]:border-foreground",
          "group-data-[disabled]/pi:bg-muted group-data-[disabled]/pi:opacity-50"
        )}
        data-invalid={invalid || undefined}
      >
        {/* The anchor holds the closed button's place and springs to a new width when the calling code changes length. */}
        <motion.div
          className="relative h-full flex-none after:absolute after:top-2.5 after:right-0 after:bottom-2.5 after:w-px after:bg-border after:transition-opacity after:duration-[var(--duration-quick)] after:content-[''] group-data-[open]/pi:after:opacity-0"
          style={{ width: anchorW }}
        >
          {/* Sizes the closed button: same padding and content, so the width spring has a target before anything moves. */}
          <span ref={measureRef} className={cn(triggerBase, "pointer-events-none invisible w-max")} aria-hidden="true">{face(current)}</span>

          {/* One material for both states. Open, it steps out over the shell's own border so the two edges never double up. */}
          <motion.div
            className={cn(
              "absolute top-0 left-0 z-2 overflow-clip bg-surface",
              "[transition:box-shadow_480ms_var(--ease-out-quint),background-color_var(--duration-quick)_var(--ease-out-quint)] motion-reduce:transition-none",
              "after:pointer-events-none after:absolute after:inset-0 after:z-3 after:rounded-[inherit] after:border after:border-border after:opacity-0 after:transition-opacity after:duration-[var(--duration-quick)] after:content-[''] contrast-more:after:border-border-strong",
              "group-data-[open]/pi:-translate-x-px group-data-[open]/pi:-translate-y-px group-data-[open]/pi:bg-surface group-data-[open]/pi:shadow-floating group-data-[open]/pi:after:opacity-100",
              "group-data-[disabled]/pi:bg-transparent"
            )}
            style={{ width: shapeW, height: shapeH, borderRadius: radius }}
          >
            <div className="absolute inset-x-0 top-0 z-1 h-[calc(var(--pi-h)-2px)]">
              <button
                ref={triggerRef}
                type="button"
                className={cn(
                  triggerBase,
                  "absolute m-0 h-auto w-[calc(100%-6px)] cursor-pointer rounded-[calc(var(--radius-md)-4px)] border-0 bg-transparent py-0 pr-[33px] pl-[9px] text-left text-foreground [font-family:inherit] [letter-spacing:inherit] touch-manipulation [-webkit-tap-highlight-color:transparent] [inset:3px_auto_3px_3px]",
                  "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                  "[@media(hover:hover)_and_(pointer:fine)]:group-not-data-[open]/pi:group-not-data-[disabled]/pi:hover:bg-muted active:enabled:bg-muted disabled:cursor-not-allowed",
                  "focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                )}
                disabled={disabled}
                inert={open || undefined}
                tabIndex={open ? -1 : 0}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label={`Country, ${current.name} +${current.dial}`}
                onClick={() => (open ? close("trigger") : openList())}
                onKeyDown={onTriggerKeyDown}
              >
                <span className={cn("relative block h-full min-w-0 flex-1 transition-opacity duration-[var(--duration-instant)]", open && "opacity-0")}>
                  <AnimatePresence initial={false} custom={roll}>
                    <motion.span
                      key={current.iso}
                      className="absolute inset-0 flex items-center gap-1.5"
                      custom={roll}
                      variants={reduced ? layerFade : layerVariants}
                      initial="enter"
                      animate="rest"
                      exit="exit"
                      transition={reduced ? { duration: 0.12 } : ({ y: GLIDE, opacity: { duration: 0.2, ease: easeEnter }, filter: { duration: 0.22, ease: easeEnter } } as never)}
                    >
                      {face(current)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>

              {/* Search takes the lid's place while the list is open. */}
              <motion.div
                className="absolute inset-0 flex items-center gap-2 pr-0.5 pl-[13px] inert:pointer-events-none"
                inert={!open || undefined}
                initial={false}
                animate={open ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)` }}
                transition={open ? { duration: 0.18, ease: easeEnter, delay: reduced ? 0 : 0.05 } : { duration: 0.1, ease: easeStandard }}
              >
                <Search className="flex-none text-muted-foreground" size={16} strokeWidth={1.75} aria-hidden="true" />
                <input
                  ref={searchRef}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit] text-sm tracking-[-0.01em] text-foreground outline-none placeholder:text-muted-foreground"
                  type="text"
                  role="combobox"
                  aria-label="Search countries or calling codes"
                  aria-expanded={open}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={open && activeKey ? optionId(activeKey) : undefined}
                  placeholder="Country or code"
                  value={query}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event) => onQuery(event.target.value)}
                  onKeyDown={onSearchKeyDown}
                />
                <AnimatePresence initial={false}>
                  {query && (
                    <motion.button
                      key="clear"
                      type="button"
                      className="grid size-6 flex-none cursor-pointer place-items-center rounded-full border-0 bg-[color-mix(in_oklab,var(--color-foreground)_8%,transparent)] p-0 text-muted-foreground transition-colors [-webkit-tap-highlight-color:transparent] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Clear search"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => { onQuery(""); searchRef.current?.focus(); }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.1 } }}
                      transition={reduced ? { duration: 0 } : GLIDE}
                    >
                      <X size={14} strokeWidth={1.75} aria-hidden="true" />
                    </motion.button>
                  )}
                </AnimatePresence>
                {/* Sits over the shared chevron, so the chevron closes the list. */}
                <button
                  type="button"
                  className="size-9 flex-none cursor-pointer rounded-full border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent] transition-colors duration-[var(--duration-quick)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[color-mix(in_oklab,var(--color-foreground)_8%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--color-foreground)_8%,transparent)] focus-visible:outline-none"
                  aria-label="Close country list"
                  onClick={() => close("trigger")}
                />
              </motion.div>

              <motion.span className="pointer-events-none absolute top-1/2 right-3 -mt-2 grid size-4 place-items-center text-muted-foreground" aria-hidden="true" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduced ? { duration: 0 } : GLIDE}>
                <ChevronDown size={16} strokeWidth={1.75} />
              </motion.span>
            </div>

            {/* The list hangs under the lid at its final width, so rows never reflow while the surface springs open. */}
            <motion.div
              ref={listFaceRef}
              className="absolute top-[calc(var(--pi-h)-2px)] left-0 box-border w-[var(--pi-panel-w)] px-1.5 pb-1.5 before:absolute before:inset-x-3.5 before:top-0 before:h-px before:bg-border/60 before:content-[''] inert:pointer-events-none"
              inert={!open || undefined}
              aria-hidden={!open || undefined}
              initial={false}
              animate={open ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: reduced ? 0 : -6, filter: reduced ? "blur(0px)" : `blur(${blur.subtle}px)` }}
              transition={open ? ({ y: GROW, opacity: { duration: 0.2, ease: easeEnter, delay: reduced ? 0 : 0.04 }, filter: { duration: 0.22, ease: easeEnter, delay: 0.04 } } as never) : { duration: 0.1, ease: easeStandard }}
            >
              <div ref={scrollRef} className="max-h-[280px] overflow-y-auto overscroll-contain pt-1.5 [scrollbar-width:thin]">
                <div id={listId} className="relative grid gap-0.5" role="listbox" aria-label="Countries">
                  <motion.span className="pointer-events-none absolute inset-x-0 top-0 rounded-[10px] bg-[color-mix(in_oklab,var(--color-foreground)_6.5%,transparent)]" style={{ y: hy, height: hh, opacity: ho }} aria-hidden="true" />
                  {sections.map((section) => {
                    const body = section.rows.map((row) => {
                      const selected = row.entry.iso === current.iso;
                      return (
                        <div
                          key={row.key}
                          id={optionId(row.key)}
                          role="option"
                          aria-selected={selected}
                          className="relative box-border flex min-h-9 cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-muted-foreground transition-colors duration-[var(--duration-quick)] data-[active]:text-foreground aria-selected:text-foreground motion-reduce:transition-none"
                          data-active={row.key === activeKey || undefined}
                          ref={(node) => { if (node) rowRefs.current.set(row.key, node); else rowRefs.current.delete(row.key); }}
                          onPointerMove={(event) => { if (event.pointerType === "mouse" && row.key !== activeKey) setActive(row.key); }}
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={() => pick(row.entry)}
                        >
                          <span className={cn("inline-grid w-5 flex-none place-items-center text-[17px] font-normal leading-none", flagFont)} aria-hidden="true">{flagOf(row.entry.iso)}</span>
                          <span className="min-w-0 flex-1 truncate font-medium">{row.entry.name}</span>
                          <span className="flex-none text-xs tabular-nums text-muted-foreground">+{row.entry.dial}</span>
                          <span
                            className="grid size-4 flex-none scale-[.6] place-items-center text-foreground opacity-0 [transition:opacity_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)] data-[on]:scale-100 data-[on]:opacity-100 motion-reduce:transition-none"
                            data-on={selected || undefined}
                            aria-hidden="true"
                          >
                            <Check size={16} strokeWidth={1.75} />
                          </span>
                        </div>
                      );
                    });
                    return section.label ? (
                      <div key={section.key} role="group" aria-labelledby={`${uid}-${section.key}`} className="grid gap-0.5 [&+&]:mt-1">
                        <div id={`${uid}-${section.key}`} className="px-2.5 pt-2 pb-1 text-xs text-muted-foreground" role="presentation">{section.label}</div>
                        {body}
                      </div>
                    ) : (
                      <div key={section.key} role="presentation" className="grid gap-0.5 [&+&]:mt-1">{body}</div>
                    );
                  })}
                  {rows.length === 0 && <p className="m-0 px-2.5 pt-3 pb-3.5 text-sm text-muted-foreground">No countries match “{query.trim()}”</p>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* The number and its guide share one box. The guide paints the typed part invisibly, then the rest of the example faintly after it. */}
        <div className="relative flex min-w-0 flex-1 items-center">
          <span className="pointer-events-none absolute inset-0 box-border flex items-center overflow-hidden py-0 pr-9 pl-3 text-sm leading-snug tracking-[-0.01em] whitespace-pre tabular-nums text-[color-mix(in_oklab,var(--color-muted-foreground)_72%,transparent)] [font-family:inherit]" aria-hidden="true">
            <span className="invisible">{formatted}</span>{guide}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            data-number=""
            className="relative z-1 m-0 box-border h-full w-full min-w-0 rounded-r-[var(--radius-md)] border-0 bg-transparent py-0 pr-9 pl-3 text-sm leading-snug tracking-[-0.01em] tabular-nums text-foreground outline-none [font-family:inherit] disabled:cursor-not-allowed"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={formatted}
            disabled={disabled}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-label={hideLabel ? label : undefined}
            onChange={(event) => onNumberChange(event.currentTarget)}
            onKeyDown={onNumberKeyDown}
            onPaste={onPaste}
            onBlur={(event) => { setTouched(digits.length > 0); onBlur?.(event); }}
          />
          <AnimatePresence initial={false}>
            {showCheck && (
              <motion.span
                key="ok"
                className="pointer-events-none absolute top-1/2 right-3 z-1 -mt-[9px] grid size-[18px] place-items-center text-success"
                aria-hidden="true"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: `blur(${blur.subtle}px)` }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.8, transition: { duration: 0.1 } }}
                transition={reduced ? { duration: 0.12 } : spring.snappy}
              >
                <Check size={16} strokeWidth={2} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <FieldMessage id={hintId} text={description && !message ? description : undefined} rollNumbers={false} />
      <FieldMessage id={errorId} text={message} tone="error" rollNumbers={false} />
      {name && <input type="hidden" name={name} value={e164} />}
      <span className="sr-only" role="status" aria-live="polite">{announcement || (showCheck ? `Valid ${current.name} number` : "")}</span>
    </div>
  );
});
PhoneInput.displayName = "PhoneInput";
