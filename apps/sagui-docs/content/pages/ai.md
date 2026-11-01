---
title: Use with AI
description: "Connect your coding assistant to SagUI's MCP server, so it picks the right component and uses its real API."
---

SagUI runs a public [Model Context Protocol](https://modelcontextprotocol.io) server. Connect your AI tool to it once, and the tool can look up which component fits a job, read that component's docs, and check the design tokens before it writes any code. It works from the same docs you are reading, so it always matches the current release.

The server is read-only and needs no account or key.

```text title="Server URL"
https://sagui-docs.vercel.app/api/mcp
```

## Connect your tool

### Claude Code

```bash
claude mcp add --transport http sagui https://sagui-docs.vercel.app/api/mcp
```

Add `--scope project` to share it with your team through the repository's `.mcp.json`.

### Cursor

Add the server to `.cursor/mcp.json` in your project, or to `~/.cursor/mcp.json` for every project.

```json title=".cursor/mcp.json"
{
  "mcpServers": {
    "sagui": { "url": "https://sagui-docs.vercel.app/api/mcp" }
  }
}
```

### VS Code

```json title=".vscode/mcp.json"
{
  "servers": {
    "sagui": { "type": "http", "url": "https://sagui-docs.vercel.app/api/mcp" }
  }
}
```

### Claude on the web and desktop

Open Settings, then Connectors, choose **Add custom connector**, and paste the server URL.

### Tools that only support local servers

Clients that can only start a local process can reach the server through `mcp-remote`:

```json title="mcp.json"
{
  "mcpServers": {
    "sagui": { "command": "npx", "args": ["-y", "mcp-remote", "https://sagui-docs.vercel.app/api/mcp"] }
  }
}
```

## Tools

| Tool | Input | Returns |
| --- | --- | --- |
| `list_components` | `category` (optional) | Every component with its import name, slug and purpose, grouped by category. |
| `search_components` | `query` | The best matches for a need in plain words, such as "confirm a delete" or "show a trend over time". |
| `get_component` | `name` | One component's full docs: when to use it and when not to, usage, every example as code, the API, keyboard, accessibility and motion notes. Accepts a slug, title or export name. |
| `get_install` | – | Installation and the Tailwind CSS setup. |
| `get_tokens` | `topic` | Token guidance for `overview` (colors and theming), `typography`, `radius`, `elevation` or `motion`, or `css` for the token stylesheet itself. |

The server also sends instructions on connect that ask the assistant to search before it builds, and to use only documented props and semantic tokens.

## Try it

Once connected, ask for something in your own words:

- "Add a SagUI chart to the dashboard that shows weekly signups against last week."
- "Which SagUI component should I use to confirm deleting a project?"
- "Restyle SagUI with sharper corners and a green primary color."

## Without MCP

Every component page is also available as plain Markdown with its examples inlined, at `/components/<slug>/markdown`. [`/llms.txt`](/llms.txt) lists all of them, for tools that read a URL instead of connecting to a server.

## For contributors

The docs repository also runs Storybook's own MCP server while Storybook is running locally, at `http://localhost:6006/mcp`. It lets an assistant working on SagUI itself read stories and preview them. It is registered for Claude Code in the repository's `.mcp.json`.
