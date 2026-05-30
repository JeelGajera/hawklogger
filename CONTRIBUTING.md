# Contributing to HawkLogger

Thanks for helping make HawkLogger better. Here's everything you need.

## Setup

```bash
git clone https://github.com/JeelGajera/hawklogger.git
cd hawklogger
npm install
```

## Development Workflow

Start the Vite dev watcher:

```bash
npm run dev
```

After each rebuild:

1. Go to `chrome://extensions`.
2. Click the refresh icon on the HawkLogger card.
3. Reload the target webpage.

The injected script change requires a full page reload because it runs in the
page's MAIN world.

## Architecture

```text
[webpage]          -> injected.ts   MAIN world, can see window.fetch
[bridge]           -> content.ts    ISOLATED world, bridges page to extension
[storage/dispatch] -> background.ts service worker, holds log store
[UI]               -> sidepanel/    React app, renders logs and copies Markdown
```

Never add business logic to `content.ts`. It is a bridge only.
Never add UI code to `background.ts`. It has no DOM.
Never read the response body without cloning first. See `injected.ts`.

## Running Tests

```bash
npm run test
npm run test -- --watch
```

## Code Standards

- TypeScript strict mode, no `any` types.
- ESLint 10 flat config lives in `eslint.config.js`.
- Tailwind CSS 4 is wired through `@tailwindcss/vite`; no Tailwind config file is required for v1.
- Run `npm run lint` before submitting a PR.
- Run `npm run typecheck` before submitting a PR.
- Prettier formats according to `.prettierrc`.

## Submitting a PR

1. Fork the repo.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Implement and test.
4. `npm run build` must succeed.
5. `npm run lint` must pass with 0 warnings.
6. Open a PR with a description of what changed and why.

## Good First Issues

XHR support and custom redaction rules are good starting points.
