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
5. Click Copy as MD to copy the full snapshot.
6. Paste into your bug ticket or team chat.

Use the Errors button to show only failed requests.
Use Settings to choose all-site capture or saved-site-only capture.

## Markdown Output

Every copied snapshot includes request and response headers, bodies, duration,
timestamp, and network error data when available. Sensitive keys are redacted
before display and before copy.

## Known Limitations

- Only intercepts `fetch`. `XMLHttpRequest` is not captured in v0.1.
- Requests fired before injection in the first few milliseconds of page load may be missed.
- Logs are in-memory only and are cleared on extension reload or browser restart.
- Binary response bodies are not captured as structured data.

## Roadmap

- XHR support.
- Console log capture with request correlation.
- Export all logs as a single Markdown file.
- Persist logs across page reload with `chrome.storage.session`.
- Custom redaction rules.
- Chrome Web Store publication.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
