import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { duration } from "@sagui/tokens/motion";
import { cn } from "../../lib/cn";
import { FieldMessage, adornmentButton, bareInput, describedBy, fieldLabel, fieldShell } from "../../lib/field";
import { easeStandard } from "../../lib/motion";

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Visible label and accessible name. */
  label: string;
  /** Helper copy under the field. */
  description?: string;
  /** Error copy. Sets aria-invalid and is announced as an alert. */
  error?: string;
}

/** One eye that a slash draws across, cutting the outline beneath it, instead of swapping two icons. */
function EyeMorph({ slashed }: { slashed: boolean }) {
  const reduced = useReducedMotion();
  const maskId = `eye-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 };
  const transition = reduced ? { duration: 0 } : { pathLength: { duration: duration.standard, ease: easeStandard }, opacity: { duration: duration.instant } };
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="white" stroke="none" />
        <motion.path d="M2 2l20 20" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={transition} />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </g>
      <motion.path d="M2 2l20 20" initial={false} animate={slash} transition={transition} />
    </svg>
  );
}

/** A password field with a reveal control. The eye draws a slash and the text resolves between dots and characters in place. */
export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ label, description, error, id, className, ...props }, ref) {
  const generated = React.useId();
  const controlId = id ?? generated;
  const [visible, setVisible] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  // data-reveal only appears after the first toggle, so the value resolves on each change but never on mount.
  return (
    <div className="grid min-w-0">
      <label className={fieldLabel} htmlFor={controlId}>{label}</label>
      <div className={cn(fieldShell(!!error), "pl-3 pr-[5px]")}>
        <input
          {...props}
          ref={ref}
          id={controlId}
          type={visible ? "text" : "password"}
          data-reveal={toggled ? (visible ? "shown" : "hidden") : undefined}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={describedBy(props["aria-describedby"], hintId, errorId)}
          className={cn(bareInput, "data-[reveal]:animate-[sg-resolve_var(--duration-standard)_var(--ease-enter)] motion-reduce:animate-none", className)}
        />
        <button type="button" className={cn(adornmentButton, visible && "text-foreground")} onClick={() => { setVisible((current) => !current); setToggled(true); }} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>
          <EyeMorph slashed={visible} />
        </button>
      </div>
      <FieldMessage id={hintId} text={description} />
      <FieldMessage id={errorId} text={error} tone="error" />
    </div>
  );
});
PasswordField.displayName = "PasswordField";
