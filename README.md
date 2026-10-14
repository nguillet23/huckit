# Huck It 🥏

Learn ultimate frisbee offense from above: guided lessons, offensive possessions against a CPU man defense, and a play whiteboard.

**Play it:** https://nguillet23.github.io/huckit/

> Early development. The title screen is live, and the game modes are coming soon. See [PLAN.md](PLAN.md) for the full design and roadmap.

## Development

Requires Node.js 24+.

```bash
npm install        # install dependencies
npm run dev        # start the dev server with hot reload
npm test           # run the game-logic tests (Vitest)
npm run lint       # lint (oxlint)
npm run build      # type-check and build to dist/
```

## Deployment

Every push to `main` runs lint, tests and the build in GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), then publishes `dist/` to GitHub Pages. Pull requests run the same checks without deploying.

## Project layout

```
src/
  sim/      game logic only (no React, no canvas), unit-tested
  App.tsx   title screen
```

More folders (`render/`, `components/`, `pages/`, `lessons/`) arrive as the milestones in PLAN.md are built.
