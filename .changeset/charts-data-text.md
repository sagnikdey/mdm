---
"@sagui/ui": minor
"@sagui/tokens": minor
---

Add charts (line, bar, donut, sparkline, gauge, streamgraph, brush, waffle, slope, activity heatmap, ridgeline, treemap), SortableDataTable, Timeline and text effects (TextReveal, InViewTitle, TextMorph, TextShimmer), ported from Arc (uiarc.dev). They are styled by prefixed stylesheets (`sg-<component>-*`) bundled into `@sagui/ui/styles.css`.

Tokens: a four colour chart palette (`--color-chart-1` to `--color-chart-4`), and `--duration-instant` / `--duration-considered`, which several components already referenced, so their transitions now run instead of snapping.

`motion` is now ^12.
