export default {
  transpilePackages: ["@sagui/ui"],
  // The MCP route reads the docs markdown, demo sources and token file at request time, by computed paths
  // that file tracing cannot follow, so they are listed for its serverless bundle.
  outputFileTracingIncludes: {
    "/api/mcp": ["./content/**/*", "./demos/**/*", "../../packages/tokens/src/tokens.css"],
  },
};
