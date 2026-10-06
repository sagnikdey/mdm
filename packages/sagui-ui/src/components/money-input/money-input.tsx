import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { Variants } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { blur, duration, spring } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, fieldLabel } from "../../lib/field";
import { easeEnter, easeStandard, physical } from "../../lib/motion";
import { useReducedFlag } from "../../lib/use-reduced";

export interface MoneyInputDetails {
  currency: string;
  /** The amount in major units, such as 12.5 for $12.50. */
  major: number | null;
  /** The amount as a full currency string, such as "$12.50". */
  formatted: string;
}

export interface MoneyInputProps {
  label: string;
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean;
  /** Amount in minor units (cents for USD, yen for JPY). `null` is empty. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null, details: MoneyInputDetails) => void;
  /** ISO 4217 code, such as "USD". */
  currency?: string;
  defaultCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  /** Codes offered by the currency menu. Pass one code to hide the menu. */
  currencies?: string[];
  /** Lowest amount in minor units. Checked when the field loses focus. */
  min?: number;
  /** Highest amount in minor units. Typing past it is refused with a nudge. */
  max?: number;
  /** Quick add chips in major units. Pass an empty array to hide them. */
  quickAdd?: number[];
  /** Arrow keys move by this many minor units. Defaults to one major unit; Shift moves ten times as far. */
  step?: number;
  /** Formatting locale. Fixed by default so server and client render the same digits. */
  locale?: string;
  description?: string;
  /** Replaces the built-in range message. */
  error?: string;
  disabled?: boolean;
  /** Adds a hidden input carrying the amount in minor units. */
  name?: string;
  id?: string;
  className?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

type Source = "type" | "chip" | "key" | "external";
type Part = { key: string; char: string; ghost: boolean };
type CurrencyInfo = { code: string; symbol: string; position: "prefix" | "suffix"; digits: number; name: string; whole: Intl.NumberFormat; full: Intl.NumberFormat };

const GLIDE = physical(0.28, 0.08);
/** A sideways kick when a limit refuses the change: the amount strains toward the press and springs home. */
const KICK = physical(0.42, 0.3);
const MAX_INTEGER_DIGITS = 12;

const infoCache = new Map<string, CurrencyInfo>();
function currencyInfo(code: string, locale: string): CurrencyInfo {
  const cacheKey = `${locale}:${code}`;
  const cached = infoCache.get(cacheKey);
  if (cached) return cached;
  const full = new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol", numberingSystem: "latn" });
  const parts = full.formatToParts(1);
  const symbolAt = parts.findIndex((part) => part.type === "currency");
  const numberAt = parts.findIndex((part) => part.type === "integer");
  const digits = full.resolvedOptions().maximumFractionDigits ?? 2;
  let name = code;
  try { name = new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code; } catch { /* older engines keep the code */ }
  const info: CurrencyInfo = {
    code, symbol: parts[symbolAt]?.value ?? code, position: symbolAt < numberAt ? "prefix" : "suffix", digits, name: name.charAt(0).toUpperCase() + name.slice(1), full,
    whole: new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0, numberingSystem: "latn" }),
  };
  infoCache.set(cacheKey, info);
  return info;
}

function localeSymbols(locale: string) {
  const parts = new Intl.NumberFormat(locale, { numberingSystem: "latn" }).formatToParts(12345.6);
  return { group: parts.find((part) => part.type === "group")?.value ?? ",", decimal: parts.find((part) => part.type === "decimal")?.value ?? "." };
}

/* A draft is the amount as typed in a canonical form: digits with an optional ".", such as "1234.5". */
const pow10 = (digits: number) => 10 ** digits;
function toMinor(draft: string, digits: number): number | null {
  if (!draft) return null;
  const [whole, fraction = ""] = draft.split(".");
  return Number(whole || "0") * pow10(digits) + Number(fraction.padEnd(digits, "0").slice(0, digits) || "0");
}
function fromMinor(minor: number | null | undefined, digits: number) {
  if (minor === null || minor === undefined || !Number.isFinite(minor)) return "";
  const text = String(Math.round(Math.abs(minor))).padStart(digits + 1, "0");
  return digits ? `${text.slice(0, text.length - digits)}.${text.slice(text.length - digits)}` : text;
}
/** Settles a draft the way it will be read back: fraction padded to the currency, leading zeros gone. */
function settle(draft: string, digits: number) { return draft ? fromMinor(toMinor(draft, digits), digits) : ""; }
/** Carries an amount across currencies with different minor units, keeping the major amount. */
function convertDraft(draft: string, digits: number) {
  if (!draft) return "";
  const [whole, fraction] = draft.split(".");
  if (!digits) return whole || "0";
  return fraction === undefined ? whole : `${whole}.${fraction.slice(0, digits)}`;
}

function groupInteger(whole: string, group: string) { return whole.replace(/\B(?=(\d{3})+(?!\d))/g, group); }
function displayOf(draft: string, symbols: { group: string; decimal: string }) {
  if (!draft) return "";
  const [whole, fraction] = draft.split(".");
  return groupInteger(whole, symbols.group) + (fraction !== undefined ? symbols.decimal + fraction : "");
}

/** Columns keyed by place value, so 9 → 10 keeps the ones column the ones column. Missing fraction digits are ghosts that hold their width. */
function partsOf(draft: string, digits: number, symbols: { group: string; decimal: string }): Part[] {
  const [whole = "", fraction] = draft ? draft.split(".") : [];
  const parts: Part[] = [];
  const intDigits = whole || "0";
  const ghostInt = !whole;
  [...intDigits].forEach((char, index) => {
    const place = intDigits.length - 1 - index;
    parts.push({ key: `i${place}`, char, ghost: ghostInt });
    if (place > 0 && place % 3 === 0) parts.push({ key: `g${place}`, char: symbols.group, ghost: ghostInt });
  });
  if (digits) {
    parts.push({ key: "d", char: symbols.decimal, ghost: fraction === undefined });
    for (let index = 0; index < digits; index++) parts.push({ key: `f${index}`, char: fraction?.[index] ?? "0", ghost: fraction === undefined || index >= fraction.length });
  }
  return parts;
}

/* Columns open their width while the digit rises in the direction of change. Typing cuts straight to the result so the caret is never behind. */
const column: Variants = {
  enter: { width: 0, opacity: 0 },
  center: { width: "auto", opacity: 1, transition: { width: spring.morph, opacity: { duration: duration.fast } } as never },
  exit: { width: 0, opacity: 0, transition: { width: spring.smooth, opacity: { duration: duration.instant } } as never },
};
const columnCut: Variants = { enter: { width: "auto", opacity: 1 }, center: { width: "auto", opacity: 1, transition: { duration: 0 } }, exit: { width: 0, opacity: 0, transition: { duration: 0 } } };
const glyph: Variants = {
  enter: (dir: number) => ({ y: `${dir * 0.55}em`, opacity: 0, filter: `blur(${blur.soft}px)` }),
  center: { y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" }, transition: { y: spring.snappy, opacity: { duration: duration.fast, ease: easeEnter }, filter: { duration: 0.18, ease: easeEnter } } as never },
  exit: (dir: number) => ({ y: `${dir * -0.55}em`, opacity: 0, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }),
};
const glyphCut: Variants = { enter: { y: 0, opacity: 1, filter: "none" }, center: { y: 0, opacity: 1, filter: "none", transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } };
const glyphFade: Variants = { enter: { y: 0, opacity: 0, filter: "none" }, center: { y: 0, opacity: 1, filter: "none", transition: { duration: duration.instant } }, exit: { opacity: 0, transition: { duration: 0 } } };

function Glyphs({ parts, direction, instant, reduced }: { parts: Part[]; direction: number; instant: boolean; reduced: boolean }) {
  const columnVariants = instant || reduced ? columnCut : column;
  const glyphVariants = instant ? glyphCut : reduced ? glyphFade : glyph;
  return (
    <AnimatePresence initial={false} custom={direction}>
      {parts.map((part) => (
        // Each character is a column: a hidden sizer holds its width and the glyph rolls inside, feathered at the top and bottom edge.
        // Missing cents wait as ghosts, so settling the amount only changes their color.
        <motion.span
          key={part.key}
          className={cn(
            "relative inline-block overflow-x-visible overflow-y-clip -my-[var(--feather)] py-[var(--feather)] [--feather:.18em] transition-colors duration-[var(--duration-standard)] motion-reduce:transition-none",
            "[mask-image:linear-gradient(to_bottom,transparent,#000_calc(var(--feather)*1.4),#000_calc(100%-var(--feather)*1.4),transparent)]",
            part.ghost && "text-[color-mix(in_oklab,var(--color-muted-foreground)_55%,transparent)]"
          )}
          data-ghost={part.ghost || undefined}
          custom={direction}
          variants={columnVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <span className="invisible whitespace-pre">{part.char}</span>
          <AnimatePresence initial={false} custom={direction}>
            <motion.span key={part.char} className="absolute inset-x-0 inset-y-[var(--feather)] text-center whitespace-pre" custom={direction} variants={glyphVariants} initial="enter" animate="center" exit="exit">{part.char}</motion.span>
          </AnimatePresence>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

/** The currency symbol swaps with a short roll while its slot springs to the new width. */
function SymbolSlot({ symbol, reduced }: { symbol: string; reduced: boolean }) {
  const sizerRef = React.useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const measured = React.useRef(false);
  React.useLayoutEffect(() => {
    const node = sizerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (!measured.current || reduced) width.jump(node.offsetWidth);
      else animate(width, node.offsetWidth, spring.morph);
      measured.current = true;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, width]);
  return (
    <motion.span className="relative mr-[.06em] inline-block whitespace-pre text-muted-foreground in-[.group]:last:mr-0 in-[.group]:last:ml-[.18em]" style={{ width }} aria-hidden="true">
      <span ref={sizerRef} className="invisible absolute top-0 left-0 whitespace-pre">{symbol}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={symbol}
          className="inline-block whitespace-pre"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: ".4em", filter: `blur(${blur.soft}px)` }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: reduced ? 0 : "-.3em", transition: { duration: duration.instant } }}
          transition={reduced ? { duration: duration.instant } : ({ y: spring.snappy, opacity: { duration: duration.fast }, filter: { duration: 0.18 } } as never)}
        >
          {symbol}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

const isSignificant = (char: string, decimal: string) => /\d/.test(char) || char === decimal;
function positionAfter(text: string, count: number, decimal: string) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) if (isSignificant(text[index], decimal) && ++seen === count) return index + 1;
  return text.length;
}

/**
 * A currency amount field. Digits group as they are typed without moving the caret, the missing cents wait as faint ghosts
 * so the amount never changes width when it settles, long amounts scale down to fit instead of scrolling, and quick add chips
 * and arrow keys roll the digits. The value comes out in minor units, so $12.50 is 1250.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput({
  label, hideLabel = false, value, defaultValue = null, onValueChange, currency: currencyProp, defaultCurrency = "USD", onCurrencyChange,
  currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR"], min, max, quickAdd = [10, 50, 100], step: stepProp, locale = "en-US",
  description, error, disabled = false, name, id, className, onBlur,
}, forwardedRef) {
  const reduced = useReducedFlag();
  const uid = React.useId();
  const inputId = id ?? `${uid}-amount`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const rangeId = `${inputId}-range`;

  const [innerCurrency, setInnerCurrency] = React.useState(defaultCurrency);
  const code = currencyProp ?? innerCurrency;
  const info = React.useMemo(() => currencyInfo(code, locale), [code, locale]);
  const symbols = React.useMemo(() => localeSymbols(locale), [locale]);
  const step = stepProp && stepProp > 0 ? stepProp : pow10(info.digits);

  const [draft, setDraft] = React.useState(() => fromMinor(value !== undefined ? value : defaultValue, info.digits));
  const minor = toMinor(draft, info.digits);

  const [seenValue, setSeenValue] = React.useState(value);
  const [source, setSource] = React.useState<Source>("external");
  const [direction, setDirection] = React.useState(1);
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== undefined && value !== minor) {
      setDraft(fromMinor(value, info.digits));
      setSource("external");
      setDirection((value ?? 0) >= (minor ?? 0) ? 1 : -1);
    }
  }

  const [focused, setFocused] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [limitFlash, setLimitFlash] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");
  const [, rerender] = React.useReducer((count: number) => count + 1, 0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);
  const pendingCaret = React.useRef<number | null>(null);
  const latest = React.useRef({ minor, draft });
  React.useLayoutEffect(() => { latest.current = { minor, draft }; });

  const money = React.useCallback((amount: number | null) => (amount === null ? "" : info.full.format(amount / pow10(info.digits))), [info]);
  const display = displayOf(draft, symbols);
  const parts = React.useMemo(() => partsOf(draft, info.digits, symbols), [draft, info.digits, symbols]);

  /* ---------------------------------------------- Limits and feedback ---------------------------------------------- */

  const bumpX = useMotionValue(0);
  const flashTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  function refuse(toward: 1 | -1, limit: number) {
    if (!reduced) animate(bumpX, 0, { ...KICK, velocity: toward * 160 });
    setLimitFlash((count) => count + 1);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setLimitFlash(0), 1400);
    setAnnouncement(`${toward > 0 ? "Maximum" : "Minimum"} is ${money(limit)}`);
  }

  function emit(nextMinor: number | null, nextInfo = info) {
    onValueChange?.(nextMinor, { currency: nextInfo.code, major: nextMinor === null ? null : nextMinor / pow10(nextInfo.digits), formatted: nextMinor === null ? "" : nextInfo.full.format(nextMinor / pow10(nextInfo.digits)) });
  }

  function setAmount(nextDraft: string, nextSource: Source) {
    const nextMinor = toMinor(nextDraft, info.digits);
    setDirection((nextMinor ?? 0) >= (latest.current.minor ?? 0) ? 1 : -1);
    setSource(nextSource);
    setDraft(nextDraft);
    latest.current = { minor: nextMinor, draft: nextDraft };
    if (nextMinor !== minor) emit(nextMinor);
    if (nextSource !== "type") setAnnouncement(money(nextMinor));
  }

  /* ---------------------------------------------- Typing ---------------------------------------------- */

  /** Reads what the input holds into a draft and counts the digits and decimal before the caret, so the caret can return to the same spot. */
  function sanitize(raw: string, caret: number) {
    let out = "";
    let before = 0;
    let dot = false;
    for (let index = 0; index < raw.length; index++) {
      const char = raw[index];
      let kept = "";
      if (/\d/.test(char)) kept = char;
      else if ((char === symbols.decimal || (char === "." && symbols.group !== ".")) && info.digits > 0 && !dot) { kept = "."; dot = true; }
      if (!kept) continue;
      out += kept;
      if (index < caret) before++;
    }
    const pieces = out.split(".");
    let whole = pieces[0];
    const fraction = pieces[1];
    const stripped = whole.length - whole.replace(/^0+/, "").length;
    whole = whole.replace(/^0+/, "");
    let shift = -Math.min(stripped, before);
    if (fraction !== undefined && !whole) { whole = "0"; shift += 1; }
    if (fraction === undefined && !whole && stripped) { whole = "0"; shift += 1; }
    if (fraction !== undefined && fraction.length > info.digits) return null;
    if (whole.length > MAX_INTEGER_DIGITS) return null;
    return { draft: fraction !== undefined ? `${whole}.${fraction}` : whole, before: Math.max(0, before + shift) };
  }

  function applyRaw(raw: string, caret: number) {
    const result = sanitize(raw, caret);
    // A refused keystroke keeps the caret where it was: one significant character before where the browser left it.
    if (!result) {
      pendingCaret.current = Math.max(0, [...raw.slice(0, caret)].filter((char) => isSignificant(char, symbols.decimal) || char === ".").length - 1);
      rerender();
      return;
    }
    const nextMinor = toMinor(result.draft, info.digits);
    if (max !== undefined && nextMinor !== null && nextMinor > max) {
      pendingCaret.current = Math.max(0, result.before - 1);
      refuse(1, max);
      rerender();
      return;
    }
    pendingCaret.current = result.before;
    setAmount(result.draft, "type");
  }

  React.useLayoutEffect(() => {
    const input = inputRef.current;
    const count = pendingCaret.current;
    pendingCaret.current = null;
    if (!input || count === null || document.activeElement !== input) return;
    const position = positionAfter(input.value, count, symbols.decimal);
    input.setSelectionRange(position, position);
  });

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const moves: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key in moves) {
      event.preventDefault();
      const amount = moves[event.key] * step * (event.shiftKey && Math.abs(moves[event.key]) === 1 ? 10 : 1);
      nudge(amount, "key");
      return;
    }
    if (event.key === "Enter") { setDraft(settle(draft, info.digits)); pendingCaret.current = Number.MAX_SAFE_INTEGER; return; }
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start !== end || event.metaKey || event.ctrlKey || event.altKey) return;
    // Deleting a group separator deletes the digit before it instead of doing nothing.
    if (event.key === "Backspace" && start > 1 && input.value[start - 1] === symbols.group) { event.preventDefault(); applyRaw(input.value.slice(0, start - 2) + input.value.slice(start - 1), start - 2); }
    if (event.key === "Delete" && input.value[start] === symbols.group) { event.preventDefault(); applyRaw(input.value.slice(0, start + 1) + input.value.slice(start + 2), start); }
  }

  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text").trim();
    if (!text) return;
    event.preventDefault();
    // "$1,234.56", "1.234,56 €", "1234.5": a final separator followed by one or two digits is the decimal; the rest are groups.
    const match = /[.,](\d{1,2})\s*\D*$/.exec(text);
    const whole = (match ? text.slice(0, match.index) : text).replace(/\D/g, "");
    const pasted = match && info.digits ? `${whole}.${match[1]}` : whole;
    if (!/\d/.test(pasted)) return;
    const input = event.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const inserted = pasted.replace(".", symbols.decimal);
    const replaceAll = (start === 0 && end === input.value.length) || !input.value;
    const raw = replaceAll ? inserted : input.value.slice(0, start) + inserted + input.value.slice(end);
    applyRaw(raw, replaceAll ? raw.length : start + inserted.length);
  }

  /* ---------------------------------------------- Steps and chips ---------------------------------------------- */

  function nudge(amount: number, nextSource: Source) {
    const from = latest.current.minor ?? 0;
    const floor = min ?? 0;
    const ceiling = max ?? Number.MAX_SAFE_INTEGER;
    let next = from + amount;
    if (next > ceiling) { if (from >= ceiling) { refuse(1, ceiling); return; } next = ceiling; refuse(1, ceiling); }
    if (next < floor) { if (from <= floor && latest.current.minor !== null) { refuse(-1, floor); return; } next = floor; }
    pendingCaret.current = Number.MAX_SAFE_INTEGER;
    setAmount(fromMinor(next, info.digits), nextSource);
  }

  /* ---------------------------------------------- Fit to width ---------------------------------------------- */

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const scale = useMotionValue(1);
  React.useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const group = groupRef.current;
    if (!wrap || !group || typeof ResizeObserver === "undefined") return;
    let first = true;
    const fit = () => {
      const natural = group.offsetWidth;
      const room = wrap.clientWidth;
      const next = natural > 0 && room > 0 ? Math.min(1, room / natural) : 1;
      if (first || reduced) scale.jump(next);
      else animate(scale, next, spring.smooth);
      first = false;
    };
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    observer.observe(group);
    return () => observer.disconnect();
  }, [reduced, scale]);

  /* ---------------------------------------------- Currency menu ---------------------------------------------- */

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeCode, setActiveCode] = React.useState(code);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const optionRefs = React.useRef(new Map<string, HTMLElement>());
  const options = React.useMemo(() => currencies.map((entry) => currencyInfo(entry, locale)), [currencies, locale]);
  const canSwitch = options.length > 1;

  const openMenu = () => { if (disabled) return; setActiveCode(code); setMenuOpen(true); };
  const closeMenu = React.useCallback((focusButton: boolean) => { setMenuOpen(false); if (focusButton) menuButtonRef.current?.focus({ preventScroll: true }); }, []);
  React.useLayoutEffect(() => { if (menuOpen) listRef.current?.focus({ preventScroll: true }); }, [menuOpen]);
  React.useEffect(() => {
    if (!menuOpen) return;
    const down = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) closeMenu(false); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [closeMenu, menuOpen]);

  const hy = useMotionValue(0), hh = useMotionValue(0), ho = useMotionValue(0);
  React.useLayoutEffect(() => {
    const node = menuOpen ? optionRefs.current.get(activeCode) : undefined;
    if (!node) { ho.jump(0); return; }
    if (ho.get() < 0.05 || reduced) { hy.jump(node.offsetTop); hh.jump(node.offsetHeight); }
    else { animate(hy, node.offsetTop, GLIDE); animate(hh, node.offsetHeight, GLIDE); }
    ho.jump(1);
    node.scrollIntoView?.({ block: "nearest" });
  }, [activeCode, hh, ho, hy, menuOpen, reduced]);

  function chooseCurrency(next: CurrencyInfo) {
    closeMenu(true);
    if (next.code === code) return;
    const nextDraft = focused ? convertDraft(draft, next.digits) : settle(convertDraft(draft, next.digits), next.digits);
    const nextMinor = toMinor(nextDraft, next.digits);
    if (currencyProp === undefined) setInnerCurrency(next.code);
    onCurrencyChange?.(next.code);
    setSource("external");
    setDraft(nextDraft);
    latest.current = { minor: nextMinor, draft: nextDraft };
    emit(nextMinor, next);
    setAnnouncement(`${next.name}${nextMinor === null ? "" : `, ${next.full.format(nextMinor / pow10(next.digits))}`}`);
  }

  const typeahead = React.useRef({ buffer: "", at: 0 });
  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const at = options.findIndex((option) => option.code === activeCode);
    const go = (index: number) => { event.preventDefault(); setActiveCode(options[Math.max(0, Math.min(options.length - 1, index))].code); };
    switch (event.key) {
      case "ArrowDown": go(at + 1); return;
      case "ArrowUp": go(at - 1); return;
      case "Home": go(0); return;
      case "End": go(options.length - 1); return;
      case "Enter": case " ": event.preventDefault(); if (options[at]) chooseCurrency(options[at]); return;
      case "Escape": event.preventDefault(); event.stopPropagation(); closeMenu(true); return;
      case "Tab": closeMenu(false); return;
    }
    if (event.key.length === 1 && /\w/.test(event.key)) {
      const now = performance.now();
      const state = typeahead.current;
      state.buffer = now - state.at > 600 ? event.key.toLowerCase() : state.buffer + event.key.toLowerCase();
      state.at = now;
      const hit = options.find((option) => option.code.toLowerCase().startsWith(state.buffer) || option.name.toLowerCase().startsWith(state.buffer));
      if (hit) { event.preventDefault(); setActiveCode(hit.code); }
    }
  }

  /* ---------------------------------------------- Messages ---------------------------------------------- */

  const range = min !== undefined && max !== undefined ? `${money(min)} to ${money(max)}` : max !== undefined ? `Up to ${money(max)}` : min !== undefined ? `At least ${money(min)}` : "";
  const outOfRange = minor !== null && ((min !== undefined && minor < min) || (max !== undefined && minor > max));
  const belowMin = minor !== null && min !== undefined && minor < min;
  const builtIn = touched && !focused && outOfRange ? (belowMin ? `The minimum is ${money(min ?? 0)}` : `The maximum is ${money(max ?? 0)}`) : undefined;
  const message = error ?? builtIn;
  const invalid = !!message;
  const describedBy = [range ? rangeId : null, description ? hintId : null, message ? errorId : null].filter(Boolean).join(" ") || undefined;
  const instant = source === "type";
  const chips = quickAdd.filter((amount) => amount > 0);

  return (
    <div className={cn("group/mi grid min-w-0 [--money-h:var(--money-input-height,76px)]", className)} data-disabled={disabled || undefined}>
      <label htmlFor={inputId} className={hideLabel ? "sr-only" : cn(fieldLabel, "justify-self-start")}>{label}</label>

      {/* One tall shell: the amount on the left, the currency on the right. Set --money-input-height to resize it. */}
      <div
        className={cn(
          "relative box-border flex h-[var(--money-h)] min-w-0 items-center gap-2 rounded-[var(--radius-xl)] border bg-surface py-0 pr-2 pl-[18px] max-[420px]:pl-3.5",
          "transition-[border-color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          "group-data-[disabled]/mi:bg-muted group-data-[disabled]/mi:opacity-50",
          focused ? "border-ring ring-[3px] ring-ring/25" : invalid ? "border-destructive" : "border-border-strong [@media(hover:hover)_and_(pointer:fine)]:hover:border-foreground",
          invalid && focused && "border-destructive ring-destructive/25"
        )}
        data-invalid={invalid || undefined}
        data-focused={focused || undefined}
      >
        {/* The amount scales down to fit rather than scroll, so a long number is always read whole. */}
        <div
          ref={wrapRef}
          className={cn("relative flex h-full min-w-0 flex-1 cursor-text items-center overflow-hidden", disabled && "cursor-not-allowed")}
          onMouseDown={(event) => { if (event.target !== inputRef.current) event.preventDefault(); }}
          onClick={(event) => { if (!disabled && event.target !== inputRef.current) { const input = inputRef.current; input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); } }}
        >
          <motion.div
            ref={groupRef}
            className="group inline-flex flex-none origin-[0_50%] items-baseline whitespace-nowrap text-4xl font-medium leading-[1.2] tracking-[-0.03em] text-foreground tabular-nums [font-kerning:none] max-[420px]:text-2xl"
            style={{ scale, x: bumpX }}
          >
            {info.position === "prefix" && <SymbolSlot symbol={info.symbol} reduced={reduced} />}
            {/* The input only draws the caret and selection. Its text is always painted by the mirror, so settled, rolling, and typed amounts share one position. */}
            <span className="relative inline-flex">
              <span className="inline-flex" aria-hidden="true" data-empty={!draft || undefined}><Glyphs parts={parts} direction={direction} instant={instant} reduced={reduced} /></span>
              <input
                ref={inputRef}
                id={inputId}
                className="absolute top-0 left-0 z-1 m-0 h-full w-[calc(100%+.5em)] border-0 bg-transparent p-0 text-transparent caret-foreground outline-none [font:inherit] [font-kerning:none] [font-variant-numeric:inherit] [letter-spacing:inherit] [line-height:inherit] selection:bg-[color-mix(in_oklab,var(--color-foreground)_16%,transparent)] selection:text-transparent disabled:cursor-not-allowed"
                type="text"
                role="spinbutton"
                inputMode={info.digits ? "decimal" : "numeric"}
                autoComplete="off"
                spellCheck={false}
                value={display}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                aria-label={hideLabel ? label : undefined}
                aria-valuenow={minor === null ? undefined : minor / pow10(info.digits)}
                aria-valuetext={minor === null ? "Empty" : money(minor)}
                aria-valuemin={min === undefined ? undefined : min / pow10(info.digits)}
                aria-valuemax={max === undefined ? undefined : max / pow10(info.digits)}
                onChange={(event) => applyRaw(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onFocus={() => setFocused(true)}
                onBlur={(event) => { setFocused(false); setTouched(true); if (draft) setDraft(settle(draft, info.digits)); onBlur?.(event); }}
              />
            </span>
            {info.position === "suffix" && <SymbolSlot symbol={info.symbol} reduced={reduced} />}
          </motion.div>
        </div>

        {canSwitch ? (
          <div ref={menuRef} className="relative flex-none">
            {/* Currency switch: plain text on the shell, a quiet fill on hover and while open. It answers a press with color, since it anchors a menu. */}
            <button
              ref={menuButtonRef}
              type="button"
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-1 rounded-full border-0 bg-transparent py-0 pr-2 pl-3 font-[inherit] text-sm font-medium text-foreground [-webkit-tap-highlight-color:transparent]",
                "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-muted active:enabled:bg-muted data-[open]:bg-muted disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              aria-controls={`${uid}-currencies`}
              aria-label={`Currency, ${info.name}`}
              data-open={menuOpen || undefined}
              onClick={() => (menuOpen ? closeMenu(true) : openMenu())}
              onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openMenu(); } }}
            >
              <span className="tabular-nums">{code}</span>
              <motion.span className="grid size-4 place-items-center text-muted-foreground" aria-hidden="true" initial={false} animate={{ rotate: menuOpen ? 180 : 0 }} transition={reduced ? { duration: 0 } : GLIDE}>
                <ChevronDown size={16} strokeWidth={1.75} />
              </motion.span>
            </button>
            <AnimatePresence>
              {menuOpen && (
                // The menu grows out of the currency button's corner and opens 8px below the shell, whatever its height.
                <motion.div
                  key="menu"
                  className="absolute top-[calc(100%+(var(--money-h)-36px)/2+.5rem)] -right-2 z-30 box-border w-[min(256px,calc(100vw-2rem))] origin-[calc(100%-44px)_calc((var(--money-h)-36px)/-2-.5rem-18px)] rounded-[var(--radius-xl)] border border-border bg-surface p-1.5 shadow-floating"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4, filter: `blur(${blur.subtle}px)` }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0, transition: { duration: duration.instant } } : { opacity: 0, scale: 0.97, y: -2, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: easeStandard } }}
                  transition={reduced ? { duration: duration.instant } : ({ ...spring.snappy, opacity: { duration: duration.fast, ease: easeEnter }, filter: { duration: duration.fast, ease: easeEnter } } as never)}
                >
                  <div
                    ref={listRef}
                    id={`${uid}-currencies`}
                    className="relative grid max-h-72 gap-0.5 overflow-y-auto overscroll-contain outline-none [scrollbar-width:thin]"
                    role="listbox"
                    tabIndex={-1}
                    aria-label="Currency"
                    aria-activedescendant={`${uid}-cur-${activeCode}`}
                    onKeyDown={onMenuKeyDown}
                  >
                    <motion.span className="pointer-events-none absolute inset-x-0 top-0 rounded-[10px] bg-[color-mix(in_oklab,var(--color-foreground)_6.5%,transparent)]" style={{ y: hy, height: hh, opacity: ho }} aria-hidden="true" />
                    {options.map((option) => (
                      <div
                        key={option.code}
                        id={`${uid}-cur-${option.code}`}
                        role="option"
                        aria-selected={option.code === code}
                        className="relative box-border flex min-h-9 cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-muted-foreground transition-colors duration-[var(--duration-quick)] data-[active]:text-foreground aria-selected:text-foreground motion-reduce:transition-none"
                        data-active={option.code === activeCode || undefined}
                        ref={(node) => { if (node) optionRefs.current.set(option.code, node); else optionRefs.current.delete(option.code); }}
                        onPointerMove={(event) => { if (event.pointerType === "mouse" && option.code !== activeCode) setActiveCode(option.code); }}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => chooseCurrency(option)}
                      >
                        <span className="w-[22px] flex-none text-center text-muted-foreground" aria-hidden="true">{option.symbol}</span>
                        <span className="flex-none font-medium tabular-nums">{option.code}</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{option.name}</span>
                        <span
                          className="grid size-4 flex-none scale-[.6] place-items-center text-foreground opacity-0 [transition:opacity_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)] data-[on]:scale-100 data-[on]:opacity-100 motion-reduce:transition-none"
                          data-on={option.code === code || undefined}
                          aria-hidden="true"
                        >
                          <Check size={16} strokeWidth={1.75} />
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <span className="flex-none px-2.5 text-sm font-medium text-muted-foreground">{code}</span>
        )}
      </div>

      {/* Quick add chips and the allowed range share one row under the shell. */}
      {(chips.length > 0 || range) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick add">
              {chips.map((amount) => {
                const add = amount * pow10(info.digits);
                const atMax = max !== undefined && (minor ?? 0) >= max;
                return (
                  <button
                    key={amount}
                    type="button"
                    className={cn(
                      "h-[30px] cursor-pointer touch-manipulation rounded-full border border-border bg-surface px-3 font-[inherit] text-xs font-medium tabular-nums text-muted-foreground [-webkit-tap-highlight-color:transparent]",
                      "[transition:background-color_var(--duration-quick)_var(--ease-out-quint),color_var(--duration-quick)_var(--ease-out-quint),border-color_var(--duration-quick)_var(--ease-out-quint),transform_var(--duration-spring)_var(--ease-spring)]",
                      "[@media(hover:hover)_and_(pointer:fine)]:hover:enabled:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:enabled:text-foreground",
                      "active:enabled:scale-[.96] active:enabled:[transition-duration:var(--duration-quick),var(--duration-quick),var(--duration-quick),100ms]",
                      "aria-disabled:opacity-45 disabled:cursor-not-allowed disabled:opacity-45",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "motion-reduce:transition-none motion-reduce:active:enabled:scale-100"
                    )}
                    disabled={disabled}
                    aria-disabled={atMax || undefined}
                    aria-controls={inputId}
                    aria-label={`Add ${info.whole.format(amount)}`}
                    onClick={() => nudge(add, "chip")}
                  >
                    +{info.whole.format(amount)}
                  </button>
                );
              })}
            </div>
          )}
          {range && (
            <span id={rangeId} className={cn("text-xs tabular-nums text-muted-foreground transition-colors duration-[var(--duration-standard)]", limitFlash > 0 && "text-warning duration-[var(--duration-instant)]")}>{range}</span>
          )}
        </div>
      )}

      <FieldMessage id={message ? errorId : hintId} text={message ?? description} tone={message ? "error" : "description"} rollNumbers={false} />

      {name && <input type="hidden" name={name} value={minor ?? ""} />}
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  );
});
MoneyInput.displayName = "MoneyInput";
