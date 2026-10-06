import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  // Motion tokens ship as TypeScript source, so they are bundled in rather than imported by consumers.
  noExternal: ["@sagui/tokens"],
  banner: { js: "'use client';" },
  esbuildOptions(o) { o.jsx = "automatic"; },
});
