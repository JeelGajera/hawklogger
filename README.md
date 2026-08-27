# HawkLogger

> Catch every request. Copy it. Ship the bug report.

A Chrome extension for QA teams. HawkLogger intercepts `fetch` network requests
on any webpage, shows them in a persistent side panel, and lets you copy a full
request and response snapshot as Markdown.

No DevTools required. The side panel stays open while you navigate.

## Features

- Instant visual status for failed requests, including 4xx, 5xx, and network errors.
- Filter by HTTP method, status class, or search URL/body.
- One-click Markdown copy with request, response, headers, body, timing, and error data.
- Auto-redacts `Authorization`, `cookie`, `token`, and other sensitive keys.
- Auto-captures requests before the side panel is opened.
- Capture settings for all sites or saved sites only.
- Per-tab isolation with a bounded in-memory history.
- Clears automatically on page navigation.
- **Failure Snapshot**: opt-in, per-data-type capture of console logs, cookies,
  `localStorage`, and `sessionStorage` attached automatically to failed
  requests only, so a dev or QA engineer who missed the moment a request
  failed can still retrieve the full context afterward. See
  [Failure Snapshot](#failure-snapshot) below.
- **Export All**: copy every visible (filtered) log as one Markdown file,
  built on a background Web Worker so exporting a large session never
  freezes the panel.
- **Copy as cURL**: one click to get a ready-to-paste, redacted `curl`
  command for any request, alongside the existing Markdown copy.
- **Light / dark / system theme**, matched to the OS by default and
  switchable per-panel from the toolbar.
- Keyboard shortcuts: `/` focuses search, `Esc` closes Settings or blurs
  search.

## Failure Snapshot

Toggle these independently in Settings. Everything is off by default, scoped
to failed requests only (network errors, 4xx, 5xx), size-capped before it's
ever stored, and redacted the same way headers already are before it's shown
or copied:

- **Console logs** — the last ~20 `console.*` calls (plus uncaught errors and
  unhandled promise rejections) leading up to the failure.
- **Cookies** — read via `chrome.cookies`, which also sees `httpOnly` cookies
  a page script cannot.
- **Local Storage** / **Session Storage** — a capped snapshot of the page's
  own storage at failure time.

Nothing captured here ever leaves the device; it's stored the same way as
the rest of a log entry (`chrome.storage.session`, cleared on navigation).

## Install for Development

```bash
npm install
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `dist/` folder.
5. Click the HawkLogger toolbar icon to open the side panel.

## Usage

1. Open any website.
2. Network requests are captured automatically, even before the side panel opens.
3. Open the HawkLogger side panel when you need to inspect or copy captured logs.
4. Click a request row to expand it.
5. Click Copy as MD for the full Markdown snapshot, or Copy as cURL for a
   redacted `curl` command.
6. Paste into your bug ticket, team chat, or terminal.

Use the Errors button to show only failed requests.
Use Settings to choose all-site capture or saved-site-only capture, and to
toggle Failure Snapshot data types.
Use the theme switch in the top-right to match system, light, or dark.

## Markdown Output

Every copied snapshot includes request and response headers, bodies, duration,
timestamp, and network error data when available. Sensitive keys are redacted
before display and before copy.

## Known Limitations

- Requests fired before injection in the first few milliseconds of page load may be missed.
- Logs are cleared on page navigation, extension reload, or browser restart.
- Binary response bodies are not captured as structured data.
- Failure Snapshot data is size-capped (see `src/utils/limits.ts`); very large
  storage or console output is truncated rather than dropped.

## Roadmap

- [x] XHR support.
- [x] Console log capture with request correlation (Failure Snapshot).
- [x] Export all logs as a single Markdown file.
- [x] Persist logs across page reload with `chrome.storage.session`.
- [x] Light / dark / system theme.
- [x] Copy as cURL.
- [ ] Custom redaction rules.
- [ ] Pin/bookmark specific requests so they survive a navigation-triggered clear.
- [ ] Chrome Web Store publication.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
