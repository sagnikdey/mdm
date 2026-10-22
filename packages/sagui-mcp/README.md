# @sagui/mcp

MCP server that gives AI coding tools the real SagUI API: components, props, tokens and usage guidance.

Data is generated, never hand-written: `npm run extract` reads `packages/tokens/src/tokens.css` and `apps/docs/content/**.md` into `data/*.json`. Re-run it (or `npm run build` at the root) after changing docs or tokens.

## Tools
| Tool | Use |
| --- | --- |
| `list_components` | Everything available, optionally by category |
| `search_components` | Find a component by intent ("pick one plan") |
| `get_component` | Import, props, usage, guidance, a11y. `sections` trims the response |
| `get_tokens` | Tokens with light/dark values and Tailwind names |
| `get_guidelines` | Foundation guides (motion, theming, radius…) |
| `validate_usage` | Flags hardcoded colors, px values, raw shadows, unknown props |

Resources: `sagui://tokens`, `sagui://components/<slug>`.

## Connect
- In this repo: already registered in `.mcp.json`.
- Claude Code elsewhere: `claude mcp add sagui -- node /path/to/sagui/packages/mcp/src/server.mjs`
- Claude Desktop / Cursor: `{ "command": "node", "args": ["/path/to/sagui/packages/mcp/src/server.mjs"] }`
- After publishing: `npx -y @sagui/mcp`

Debug with `npm run inspect -w @sagui/mcp`.
