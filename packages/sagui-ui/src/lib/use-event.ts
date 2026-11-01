import * as React from "react";

/** A stable callback that always calls the latest function passed in. Works on React 18 and 19. */
export function useEvent<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = React.useRef(fn);
  React.useLayoutEffect(() => { ref.current = fn; });
  return React.useCallback(((...args: never[]) => ref.current(...args)) as T, []);
}
