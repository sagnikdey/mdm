import * as React from "react";
import { cn } from "../../lib/cn";
import { FieldMessage, describedBy, fieldLabel, inputControl } from "../../lib/field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label and accessible name. */
  label: string;
  /** Helper copy under the field. Linked with aria-describedby. */
  description?: string;
  /** Error copy. Sets aria-invalid, is announced as an alert, and colors the border. */
  error?: string;
}

/** A multiline field for notes and descriptions. Same label, helper and error behavior as Input. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, description, error, id, className, ...props }, ref) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  return (
    <div className="grid min-w-0">
      <label className={fieldLabel} htmlFor={controlId}>{label}</label>
      <textarea
        {...props}
        id={controlId}
        ref={ref}
        className={cn(inputControl, "min-h-[110px] resize-y py-2.5", className)}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy(props["aria-describedby"], hintId, errorId)}
      />
      <FieldMessage id={hintId} text={description} />
      <FieldMessage id={errorId} text={error} tone="error" />
    </div>
  );
});
Textarea.displayName = "Textarea";
