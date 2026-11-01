/**
 * Class names for components styled by a plain stylesheet rather than Tailwind utilities (the charts, the data table,
 * the timeline and the text effects). `cssModule("sg-gauge").figure` is "sg-gauge-figure", which the component's
 * .css file defines. The prefix keeps every class global but collision free, so the styles ship with @sagui/ui/styles.css.
 */
export function cssModule(prefix: string): Record<string, string> {
  return new Proxy({} as Record<string, string>, {
    get: (_, key) => (typeof key === "string" ? `${prefix}-${key}` : undefined),
  });
}
