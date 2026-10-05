import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  banner: { js: "'use client';" },
  esbuildOptions(o) { o.jsx = "automatic"; },
});
