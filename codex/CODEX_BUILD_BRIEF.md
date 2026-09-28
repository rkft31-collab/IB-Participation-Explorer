# CODEX BUILD BRIEF — IB Participation Explorer

## Goal
Build a shareable research prototype for **950 existing IB Diploma Programme schools**. A user selects a school and explores its observed IB participation, peer median, peer-achievable P75, participation gap, peer schools, map, matching characteristics, and alternative benchmark views.

## Non-negotiable research constraints
Read `docs/METHODOLOGY.md` and `docs/DATA_DICTIONARY.md` before writing UI logic.

1. `public/data/` is a **derived display layer**; do not recalculate peer models in the browser.
2. Default benchmark = `national`.
3. Keep `national`, `stateReadiness`, and `commonAssessment` separate. Never average them or present a composite "underutilization score."
4. Display unavailable/unsupported benchmark states explicitly.
5. P75 is a peer percentile, not 75% participation.
6. Equivalent gap is descriptive, not a forecast.
7. Preserve NCES IDs as strings.
8. Do not fetch school facts from the internet at runtime. The prototype should be deterministic from the frozen package.

## Recommended stack
- React + TypeScript + Vite
- Recharts for plots
- `react-simple-maps` or an equivalent lightweight SVG U.S. map solution
- client-side data only; no backend/database for v1
- GitHub Pages deployment via GitHub Actions

Avoid unnecessary UI frameworks; a small accessible component system or hand-authored CSS is preferred.

## Core routes/state
Single-page app. Read/write URL query params:
- `school=<NCESSCH>`
- `benchmark=national|stateReadiness|commonAssessment`

If no school is selected, render an informative landing/search state.

## Required components
- `SchoolSelector`: state filter + searchable school autocomplete.
- `SchoolHeader`: school/district/location.
- `BenchmarkTabs`: National Structural / State + Readiness / Common Assessment; disable with reason when unsupported.
- `SnapshotCards`: observed, peer median, peer P75, gap; equivalent gap below with tooltip.
- `PeerParticipationChart`: target + 10 peers, ordered by IB participation, reference markers/lines for median and P75.
- `PeerMap`: target + current peer set from bundled lat/lon; target visually distinct.
- `PeerTable`: rank, name, state, participation, enrollment, FRPL, readiness when appropriate, distance; peer school name is clickable.
- `PeerCharacteristics`: target vs peer median for matching variables; include readiness only for state-readiness view.
- `BenchmarkComparison`: available views side-by-side; no composite.
- `MethodologyDrawer`: concise method + interpretation definitions.
- `SupportNotice`: state-local forced/constrained support information.

## Visual direction
Clean research/data-journalism aesthetic: white/off-white background, strong typography, restrained accent color, generous spacing, clear annotations. Avoid corporate KPI-dashboard clutter, gauges, traffic-light judgments, and radar charts.

## Data loading
Start from the frozen files under `public/data/`. Do not recalculate peers in the UI. Keep a data-access module so files can later be split/lazy-loaded without rewriting components.

## Formatting rules
- participation/P75: one decimal percent by default.
- gap: one decimal percentage point; positive means target is below P75.
- equivalent gap students: whole-number approximation with `≈`.
- readiness percentile: whole-number percentile.
- distance: two decimals unless more detail is requested.

## Testing / acceptance criteria
- All 950 schools searchable.
- Every national view resolves exactly 10 peer links.
- State/common tabs only enabled for schools with `available=true`.
- Switching school updates URL and all panels.
- Switching benchmark updates all benchmark-dependent panels.
- Peer click navigates to peer target school without page reload.
- No NaN/undefined displayed.
- Mobile layout works at 375px width.
- Keyboard access works for selector and tabs.
- `npm run build` succeeds.
- GitHub Pages workflow succeeds with correct Vite base path.

## Build in phases
See `codex/TASK_01.md` through `TASK_06.md`. Complete each phase and verify before moving to the next.
