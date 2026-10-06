import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { categories } from "../../../lib/content";
import { getComponentDocs, getInstall, getTokens, instructions, listComponents, searchComponents, tokenTopics } from "../../../lib/mcp";

/** Read-only tools: they only return documentation. */
const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });

/**
 * SagUI's MCP server. Connect with:
 *   claude mcp add --transport http sagui https://sagui-docs.vercel.app/api/mcp
 */
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_components",
      {
        title: "List components",
        description: "Every SagUI component with its import name, slug and one-line purpose, grouped by category. Optionally filter to one category.",
        inputSchema: z.object({
          category: z.string().optional().describe(`A category id or title. One of: ${categories.map((group) => group.id).join(", ")}.`),
        }),
        annotations: readOnly,
      },
      async ({ category }) => text(listComponents(category)),
    );

    server.registerTool(
      "search_components",
      {
        title: "Search components",
        description: "Find the right SagUI component for a need described in plain words, such as \"pick a date range\", \"confirm a delete\" or \"show a trend over time\".",
        inputSchema: z.object({ query: z.string().min(1).describe("What the interface needs to do.") }),
        annotations: readOnly,
      },
      async ({ query }) => text(searchComponents(query)),
    );

    server.registerTool(
      "get_component",
      {
        title: "Get component docs",
        description: "Full documentation for one component as Markdown: when to use it and when not to, usage, every example as code, the API reference, keyboard, accessibility and motion notes.",
        inputSchema: z.object({ name: z.string().min(1).describe("Slug (\"line-chart\"), title (\"Line chart\") or export name (\"LineChart\").") }),
        annotations: readOnly,
      },
      async ({ name }) => text(getComponentDocs(name)),
    );

    server.registerTool(
      "get_install",
      {
        title: "Get installation steps",
        description: "How to install @sagui/ui, import its styles into a Tailwind CSS v4 app, and render a first component.",
        inputSchema: z.object({}),
        annotations: readOnly,
      },
      async () => text(getInstall()),
    );

    server.registerTool(
      "get_tokens",
      {
        title: "Get design tokens",
        description: "Design tokens and how to use and override them. overview covers colors and theming; typography, radius, elevation and motion cover their foundations; css returns the token stylesheet itself.",
        inputSchema: z.object({ topic: z.enum(tokenTopics).default("overview") }),
        annotations: readOnly,
      },
      async ({ topic }) => text(getTokens(topic)),
    );
  },
  { serverInfo: { name: "sagui", version: "0.1.0" }, instructions },
);

export { handler as GET, handler as POST, handler as DELETE };
