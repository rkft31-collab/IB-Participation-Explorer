# IB Participation Explorer

A shareable research prototype for exploring participation among **950 existing IB Diploma Programme schools**.

A user selects a school and compares its observed IB participation with participation already demonstrated by comparable IB programs. The default **National Structural** view uses the frozen 10-peer model and displays the peer median, peer-achievable P75, gap to P75, and equivalent student difference.

## Research constraints

- The dashboard is a **derived presentation layer**. It does not recalculate peer models in the browser.
- National Structural, State + Readiness, and Common Assessment are separate benchmark views and must never be averaged into a composite score.
- **P75 means the 75th percentile of peer participation rates; it does not mean 75% student participation.**
- Equivalent-gap students translate the positive percentage-point gap into students; they are descriptive, not a forecast.
- NCES IDs are strings and must preserve leading zeroes.

Read `docs/METHODOLOGY.md`, `docs/DATA_DICTIONARY.md`, and `codex/CODEX_BUILD_BRIEF.md` before changing analytical display logic.

## Phase 1

Phase 1 implements the application shell, data layer, school search, URL state, school header, benchmark tabs, and the National Structural snapshot. See `PHASE_1_STATUS.md`.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The Vite base path is configured for the GitHub Pages repository name `IB-Participation-Explorer`.

## Frozen source

The presentation data were generated from the frozen IB Participation dashboard starter package dated **2026-09-27**. Research source files remain authoritative; dashboard JSON is derived output.
