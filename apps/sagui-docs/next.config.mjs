export default {
  transpilePackages: ["@sagui/ui"],
  // The monorepo root ESLint config targets the MDM apps and cannot parse this app.
  eslint: { ignoreDuringBuilds: true },
  // The MCP route reads the docs markdown, demo sources and token file at request time, by computed paths
  // that file tracing cannot follow, so they are listed for its serverless bundle.
  outputFileTracingIncludes: {
    "/api/mcp": ["./content/**/*", "./demos/**/*", "../../packages/sagui-tokens/src/tokens.css"],
  },
};
