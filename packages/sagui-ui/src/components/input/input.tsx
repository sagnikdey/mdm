import * as React from "react";
import { cn } from "../../lib/cn";
import { FieldMessage, describedBy, fieldLabel, inputControl } from "../../lib/field";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label and accessible name. */
  label: string;
  /** Helper copy under the field. Linked with aria-describedby. */
  description?: string;
  /** Error copy. Sets aria-invalid, is announced as an alert, and colors the border. */
  error?: string;
}

/** A single line field with a label, helper copy and an error that open and close without moving the layout around them. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ label, description, error, id, className, ...props }, ref) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  return (
    <div className="grid min-w-0">
      <label className={fieldLabel} htmlFor={controlId}>{label}</label>
      <input
        {...props}
        id={controlId}
        ref={ref}
        className={cn(inputControl, className)}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy(props["aria-describedby"], hintId, errorId)}
      />
      <FieldMessage id={hintId} text={description} />
      <FieldMessage id={errorId} text={error} tone="error" />
    </div>
  );
});
Input.displayName = "Input";
