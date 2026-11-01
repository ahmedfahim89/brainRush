# BrainRush Trivia connector for Claude

A connector that adds a BrainRush trivia card to Claude's Chat and Cowork (web, desktop and mobile apps). Ask Claude for BrainRush trivia and an interactive card opens in the conversation: each question has 3 answers, some have a picture, you tap one, see right or wrong, and go on. The card keeps a score for as long as it is open.

It complements the Claude Code mod (`ahmedfahim89/brainrush-trivia-claude-mod`), which shows questions above the prompt while Claude Code works. That band exists only in Claude Code; in Chat and Cowork the card opens when you ask for it.

## Add it to Claude

Connector URL: `https://brainrush.integration.ninja/api/mcp.php` (no sign-in).

- **Chat (claude.ai, desktop, mobile):** Settings, then Connectors, then **Add custom connector**. Enter a name (BrainRush Trivia) and the URL, then **Add**. In a chat, check that the connector is switched on in the tools menu.
- **Cowork:** connectors added to your account should be available there too; check that it is switched on for the task.
- **Team or Enterprise accounts** (such as a company account): an Owner may have to allow custom connectors first, or add it for the organization.

Then ask, for example, "Let's play BrainRush trivia". The first time, Claude asks to show the card: choose **Allow** (or **Always allow**).

## How it works

`api/mcp.php` is a remote MCP server (Streamable HTTP). It is stateless: every request is one JSON-RPC message in a `POST`, answered with plain JSON. `GET` and `DELETE` get 405, as a server without sessions or server-sent events should.

| Piece | What it does |
| --- | --- |
| Tool `show_brainrush_trivia` | The one tool the model sees. It opens the card (`_meta.ui.resourceUri`) and returns one short sentence, so its result holds no questions or answers: no tokens spent on them, no spoilers. |
| Tool `brainrush_trivia_questions` | Card only (`_meta.ui.visibility: ["app"]`): `{ exclude: [id, ...] }` returns up to 20 questions from `streak_batch()` in `api/questions.php`, each with 3 choices and the index of the right one. The card sends the ids it already showed, so a card never repeats a question. |
| Resource `ui://brainrush/trivia-card` | `mcp/trivia-card.html`, type `text/html;profile=mcp-app`. Claude draws it in a sandboxed frame. `_meta.ui.csp.resourceDomains` allows the site's origin, where the card loads its script and the question pictures. |
| `mcp/ext-apps-1.7.5.js` | The MCP Apps browser client (`@modelcontextprotocol/ext-apps` 1.7.5, `app-with-deps.js`, unmodified; license in `mcp/ext-apps-LICENSE`). Served from our own site so the card does not depend on a public CDN. `.htaccess` sends it with `Access-Control-Allow-Origin: *` and a JavaScript type, because the card imports it as a module from another origin. |

The card follows Claude's theme (light or dark) and fonts through the host's style variables, with its own fallbacks. Keys `1` to `3` answer, `Enter` goes to the next question.

`api/questions.php` serves the game when it is requested directly. When `api/mcp.php` includes it (after defining `QUESTIONS_INCLUDE_ONLY`), it only defines its functions.

To change the site address (another domain), change `MCP_SITE` in `api/mcp.php`. To update the client library, put the new `app-with-deps.js` in `mcp/` under its version's name and change the import in `mcp/trivia-card.html`.

## Test it

Locally (`php -S localhost:8000`, local database running):

```
curl -s -X POST http://localhost:8000/api/mcp.php -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"
```

`initialize`, `tools/list`, `resources/read` (uri `ui://brainrush/trivia-card`) and `tools/call` for both tools answer the same way. To see the card itself without Claude, use a local test page that plays the host's part with the SDK's `AppBridge` (draws the card from `resources/read` and forwards its `tools/call` to the server); the built-in server does not apply `.htaccess`, so serve the card from the same origin there.

On the live site, after a deploy:

1. The same `curl` against `https://brainrush.integration.ninja/api/mcp.php`.
2. `curl -sI https://brainrush.integration.ninja/mcp/ext-apps-1.7.5.js` shows `Access-Control-Allow-Origin: *`.
3. In Claude: add the connector, ask for BrainRush trivia, **Allow**, and play a few questions (one with a picture), in light and dark mode, then in Cowork.

## Limits

- The card opens when Claude calls the tool, usually because you asked. It does not appear by itself while Claude works on something else.
- Opening it costs a few tokens (the tool call and its one-sentence result). The card loads its questions with its own tool calls, which go through Claude's app to the server; the MCP Apps specification does not say whether a host ever shows those calls to the model, so treat "no tokens while playing" as likely, not guaranteed.
- Claude allows 240 seconds per tool call and about 150,000 characters per result; a batch of 20 questions is far below that.
