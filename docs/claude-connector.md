# Mokh Rush Trivia connector for Claude

A connector that adds a Mokh Rush trivia card to Claude's Chat and Cowork (web, desktop and mobile apps). Ask Claude for Mokh Rush trivia and an interactive card opens in the conversation: each question has 3 answers, some have a picture, you tap one, see right or wrong, and go on. The card keeps a score for as long as it is open.

It complements the Claude Code mod (`ahmedfahim89/brainrush-trivia-claude-mod`), which shows questions above the prompt while Claude Code works. That band exists only in Claude Code; in Chat and Cowork the card opens when you ask for it.

## Add it to Claude

Connector URL: `https://brainrush.integration.ninja/api/mcp.php` (no sign-in). Use one of the two ways below, not both, or Claude gets the same tools twice. Menu names follow Anthropic's [Add a connector that isn't in the directory](https://claude.com/docs/connectors/custom/add-unlisted).

**Option A: install the plugin.** The mod repository bundles this connector (`.mcp.json`), so the plugin brings the card to Chat and Cowork and the band to Claude Code:

1. In claude.ai or the desktop app, go to **Customize > Plugins > Add > Add marketplace** and enter `ahmedfahim89/brainrush-trivia-claude-mod`.
2. Install **BrainRush Trivia** (the plugin keeps that name in the mod repository until the mod is renamed).
3. Open the plugin's **Connectors** tab and connect **brainrush-trivia**.

**Option B: add only the connector by its URL.**

On a Free, Pro, Max or Ultra plan:

1. Go to **Customize > Connectors**.
2. Click **Add custom connector**.
3. Name it `Mokh Rush Trivia` and enter the connector URL.
4. Leave the OAuth fields under **Advanced settings** empty, or choose **No sign-in** if the dialog asks how people authenticate.
5. Click **Add**. (The Free plan allows one custom connector.)

On a Team or Enterprise plan (such as a company account), members can't add a custom connector themselves:

1. An Owner goes to **Organization settings > Connectors**, selects **Add**, then **Custom** (type **Web** if asked), enters the URL, chooses no sign-in, and clicks **Add**.
2. Each member goes to **Customize > Connectors**, finds **Mokh Rush Trivia** with the **Custom** label, and clicks **Connect**.

**Play:** in a chat, click **+**, select **Connectors** and check that Mokh Rush Trivia is on (in Cowork, check it is on for the task). Then ask, for example, "Let's play Mokh Rush trivia". The first time, Claude asks to show the card: choose **Allow** (or **Always allow**). To remove the connector, go to **Customize > Connectors** and click **Remove**.

## ChatGPT

ChatGPT implements the same MCP Apps standard, so the same URL gives the same card there, with no change to the server or the card (checked on 1 November 2026: answering, scoring, a picture question, light and dark mode).

1. Go to [chatgpt.com/plugins](https://chatgpt.com/plugins), click **+**, then **Add custom MCP server**.
2. Name it `Mokh Rush Trivia` and enter the connector URL.
3. Choose no authentication, review the warning and confirm, then **Create as a plugin**.

On a Business or Enterprise workspace an admin may have to allow custom MCP servers first. To play, pick Mokh Rush Trivia in the composer (type `@`) and ask for a game. ChatGPT may show a "CSP off" label above the card for a custom server; the card works the same. Listing it in ChatGPT's own directory would need OpenAI's app submission and review.

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
3. In Claude: add the connector, ask for Mokh Rush trivia, **Allow**, and play a few questions (one with a picture), in light and dark mode, then in Cowork.

## Limits

- The card opens when Claude calls the tool, usually because you asked. It does not appear by itself while Claude works on something else.
- Opening it costs a few tokens (the tool call and its one-sentence result). The card loads its questions with its own tool calls, which go through Claude's app to the server; the MCP Apps specification does not say whether a host ever shows those calls to the model, so treat "no tokens while playing" as likely, not guaranteed.
- Claude allows 240 seconds per tool call and about 150,000 characters per result; a batch of 20 questions is far below that.
