# Fundament · public interactive demo

A static, ephemeral demo of the actual Fundament dashboard. Six life areas, a quarterly focus, and a daily view limited to three next actions. UI language: German.

## Try

Complete a suggested action, add an action, change an area's status, switch quarterly focus, or mark a quarterly criterion done. The evidence trail and momentum update locally. **Zurücksetzen** and reloading restore the sample profile.

## Privacy boundary

- All initial content is synthetic, neutral example content from the public project defaults plus two synthetic completed actions.
- State lives in React memory only. There is no database, authentication, API request, analytics, local/session storage, or autosave.
- CSP `connect-src 'none'` blocks runtime network connections. All runtime dependencies and fonts are local; the system font stack needs no external font service.
- Visitor edits are discarded on reset/reload. The private hosted application and its data are not used or modified.

## Provenance and scope

The page, UI components, deterministic suggestion model and styling are reused from the owner's public [`mduransu-maker/fundament`](https://github.com/mduransu-maker/fundament) launch commit `f0837d575f813ab4bb279a89640e76ef740f4512`. They were copied from the committed revision, not the locally modified working tree.

Demo-specific changes remove backend loading/autosave and WebMCP registration, add a reset control and sample-data notice, and create a small synthetic evidence trail. This static version does not demonstrate cloud persistence, user isolation or WebMCP integration.

## Development

Node 22.18+ and npm:

```sh
npm ci
npm test
npm run build
npm run preview
```

Publish only `dist/` to static hosting. Vite uses relative asset paths, so this works under a GitHub Pages repository path without a router fallback.

The vendored shadcn stylesheet's license is retained in `vendor/`.
