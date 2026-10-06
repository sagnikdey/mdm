import * as React from "react";

export type CopyFeedbackState = "idle" | "copied" | "error";

/** Shared clipboard state for actions that render their own button or menu. */
export function useCopyFeedback(duration = 1900) {
  const [state, setState] = React.useState<CopyFeedbackState>("idle");
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = React.useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setState("idle");
    setActiveKey(null);
  }, []);

  React.useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);

  const copy = React.useCallback(async (value: string, key = "default") => {
    if (timeout.current) clearTimeout(timeout.current);
    setActiveKey(key);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      timeout.current = setTimeout(reset, duration);
      return true;
    } catch {
      setState("error");
      timeout.current = setTimeout(reset, duration);
      return false;
    }
  }, [duration, reset]);

  return { state, activeKey, copy, reset };
}
