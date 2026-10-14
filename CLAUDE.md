# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Huck It**: a 2D top-down ultimate frisbee game that teaches new players **offense**. It's a React + TypeScript site (Vite), with the field drawn on an HTML `<canvas>`, deployed to GitHub Pages at https://nguillet23.github.io/huckit/ (repo `nguillet23/huckit`).

`PLAN.md` is the source of truth for design decisions and the milestone roadmap. Read it before adding features, and update its decision list when the user changes a decision. Settled decisions that constrain the code:
- **Offense only.** The player is always on offense, and the CPU only ever plays **person-to-person (man) defense** with a forehand or backhand force. Don't add player-controlled defense or zone.
- **USA Ultimate rules only.** Field is 70×40 yd with 20 yd endzones, brick marks 20 yd from each goal line, stall count to 10 with the marker within 10 ft.
- **One CPU difficulty, tuned for teaching:** correct reads should reliably succeed, and bad reads (break-side throws, throws to covered cutters) should get punished.
- **Three modes on the title screen:** Lessons, Play (Quarterback and Player control modes) and Whiteboard. **Two camera views:** Sky (whole field) and Handler (flat, rotated so the attack direction is up, following the thrower).
- **Art:** whiteboard-style dots first. Keep drawing code swappable for a later pixel-art skin.

Current state: Milestone 1 in progress. Done so far:
- The scaffold, title screen and deploy pipeline.
- The canvas field, shown on a preview page at `/#/field`.
- The rules engine (`src/sim/possession.ts`).
- The CPU man defense AI (`src/sim/defense.ts`).

Next: wire a `requestAnimationFrame` game loop into the preview page.

## Commands

```bash
npm run dev                          # Vite dev server (served under /huckit/)
npm test                             # Vitest, single run
npm run test:watch                   # Vitest watch mode
npx vitest run src/sim/field.test.ts # one test file
npx vitest run -t "brick marks"      # tests whose name matches
npm run lint                         # oxlint
npm run build                        # tsc -b (type-check) + vite build → dist/
```

CI (`.github/workflows/deploy.yml`) runs `npm ci → lint → test → build` on every push and PR, and deploys `dist/` to GitHub Pages only from `main`. A failing lint, test or type-check blocks the deploy, so run all three before pushing.

## Architecture

The core rule: **game logic in `src/sim/` is plain TypeScript with no React, DOM or canvas imports**, so it runs headlessly under Vitest and is shared by every mode. Planned layering (see PLAN.md §8). Only `sim/` and `App.tsx` exist so far:

- `src/sim/`: game state, rules, CPU man defense, AI cutters and throwers.
  - `possession.ts` is the rules engine. **One possession ends at a goal or a turnover**, since the CPU never plays offense. State is a mutable `GameState`, advanced by `step(state, dt)`.
  - Commands go in (`throwTo`, `setTarget`, and later `callCut` and `callForDisc`). Typed `SimEvent`s come out (`throw`, `completion`, `goal`, and `turnover` with a `reason`: `drop`, `incomplete`, `block`, `interception`, `handblock`, `out`, `caught_out` or `stall`). The UI reads them with `drainEvents`.
  - Randomness goes through the injected `state.rng` (seeded by default). Tests pass a constant rng to force outcomes. For example, `() => 0.5` means no blocks, no interceptions and every catch made. Tunable probabilities live in `ODDS`, rules in `RULES`, speeds in `SPEED`.
  - `defense.ts` is the CPU man defense. It only sets defender targets, and the rules engine decides outcomes.
    - Each frame, call `updateDefense(ai, state, dt)` before `step(state, dt)`.
    - Downfield defenders re-read their player only every 0.18–0.34 s. That delay is deliberate: it's what lets sharp cuts get open. Tuning lives in `DEFENSE`.
  - Position history for turnover replays is planned.
- `src/render/`: canvas drawing of sim state, including camera transforms for the Sky and Handler views, and overlays (open/break shading, cut paths, throw preview, vision cone). Views are rendering-only and never change the sim.
- `src/input/`: mouse, touch, keyboard and joystick input translated into sim commands.
- `src/components/` and `src/pages/`: React UI. Routing uses React Router with a **`HashRouter`** (`/#/lessons/s1`), because GitHub Pages can't serve SPA deep links.
- `src/lessons/`: lessons as data files (text cards, scripted moves, challenge, star thresholds).

**React and the game loop:** sim state lives in a `useRef`, and a `requestAnimationFrame` loop inside the field-canvas component steps the sim and draws directly. Only push into React state when the HUD needs to change (sim events, stall ticks, pause). Never re-render React every frame.

**Coordinates:** yards. `x` runs 0–110 along the length (endzones are 0–20 and 90–110), and `y` runs 0–40 across the width. Each team's attack direction is +1 or −1. Use the constants in `src/sim/field.ts` rather than hard-coding numbers.

## Gotchas

- **Base path:** `vite.config.ts` sets `base: '/huckit/'`. Reference public assets so Vite rewrites them (for example `/favicon.svg` in `index.html`). Don't hard-code `/huckit/` in source. If the repo is renamed, `base` must change too.
- **Platform:** Windows, and the repo lives inside OneDrive. `node_modules` installs can be slow or hit file locks while OneDrive syncs.
- **Line endings:** `.gitattributes` forces LF.
- **GitHub CLI:** `gh` was installed at `C:\Program Files\GitHub CLI\gh.exe` and may not be on PATH in older shells. Git pushes use it as the credential helper (configured in this repo's git config).
