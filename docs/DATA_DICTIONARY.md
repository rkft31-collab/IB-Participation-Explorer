# IB Participation Explorer — Dashboard Data Dictionary

## Purpose
This dictionary describes the **derived presentation layer** for the 950-school existing-IB research prototype. The authoritative analytical outputs remain the frozen research CSVs in `source-data/`. Dashboard JSON should be regenerated from those files rather than edited manually.

## Unit convention
All dashboard fields ending in `Pct` are stored as **percentage points from 0 to 100**. For example, `observedPct: 12.4` means 12.4%, not 0.124. Fields ending in `gapPp` are percentage-point differences.

## `public/data/schools.json`
One object per valid existing IB school.

### Identity and geography
- `id`: 12-character NCES school ID (`NCESSCH`). Keep as a string to preserve leading zeros.
- `name`: school name.
- `district`: LEA/district name.
- `state`, `stateName`: postal abbreviation and full state name.
- `city`, `zip`: location labels from the frozen federal master.
- `location.lat`, `location.lon`: EDGE-derived latitude/longitude for mapping.

### `structure`
These fields support both display and explanation of peer selection.
- `charter`: frozen charter grouping used by the peer model.
- `gradeConfig`: frozen broad grade-configuration group.
- `localeBroad`, `localeLabel`: NCES/EDGE locale grouping and label.
- `enrollment912`: frozen grades 9-12 offered enrollment denominator.
- `frplPct`: FRPL rate ×100.
- `hispanicPct`, `blackPct`, `asianPct`: high-school demographic shares ×100.
- `studentTeacherRatio`: winsorized student-teacher ratio used in matching.

### `ib`
- `enrollment`: observed IB enrollment used by the research model.
- `observedPct`: observed IB participation rate ×100.

### `readiness`
- `tier`: Tier 1 / Tier 2 / Tier 3 school-level readiness classification.
- `available`: whether usable school-level readiness exists.
- `stateZ`: within-state standardized readiness score. Do not interpret as a common national raw test scale.
- `statePercentile`: school percentile within its state/recoverable state distribution.
- `source`, `qualityFlag`, `cautionFlag`: provenance and quality context retained from the national readiness master.

### `benchmarks.national`
Frozen national structural/locale K=10 view.
- `available`, `status`.
- `peerMedianPct`: median of peer IB participation rates ×100.
- `peerP75Pct`: 75th percentile of peer IB participation rates ×100.
- `gapPp`: peer P75 minus observed IB participation in percentage points. Negative means the target exceeds P75.
- `equivalentGapStudents`: `max(0, gap) × enrollment`. Descriptive equivalent gap only; not a forecast.
- `gradeRelaxed`: whether broad grade configuration had to be relaxed.
- `meanDistance5`: mean distance to the five nearest peers from the frozen model.
- `similarityPercentile`: frozen similarity percentile.
- `peerIds`: ten NCES school IDs.

### `benchmarks.stateReadiness`
Current frozen-rules state-local readiness K=10 view.
- `available`, `status`.
- `eligibleReferenceCount`: number of eligible same-state/same-charter IB references before selecting the ten nearest.
- `supportFlag`: explains constrained/forced matching, including exactly-ten cases.
- `gradeRelaxed`.
- `peerMedianPct`, `peerP75Pct`, `gapPp`, `equivalentGapStudents`.
- `meanPeerDistance`.
- `peerIds`.
- `method`: retained analysis method label.

### `benchmarks.commonAssessment`
Common-test analog where an exact frozen target benchmark exists.
- `available`.
- `family`: ACT or SAT-family.
- `metric`, `raw`, `poolZ`.
- `view`: benchmark implementation identifier.
- `status`.
- `peerMedianPct`, `peerP75Pct`, `gapPp`, `equivalentGapStudents`.
- `peerIds`.
- `note`: provenance/caveat text.

## Peer-link files
- `peer-links-national.json`
- `peer-links-state-readiness.json`
- `peer-links-common-assessment.json`

Each is an object keyed by target `NCESSCH`. Each value is an ordered peer array.

Peer fields:
- `rank`: 1-10.
- `peerId`, `peerName`, `peerState`.
- `ibPct`: peer IB participation in percentage points.
- `distance`: standardized matching distance under that benchmark.
- `sameLocale`, `sameState`.
- `targetReadinessZ`, `peerReadinessZ`: populated where retained by the readiness model.
- `gradeRelaxed`.
- `sourceView`: exact benchmark implementation name.

## `school-index.json`
Small search/autocomplete index: ID, school name, district, state, city.

## `states.json`
State selector metadata and coverage counts.

## `metadata.json`
Frozen package version, source hashes, benchmark definitions, counts, and interpretation rules.

## Interpretation guardrails
1. **P75 is not 75% participation.** It is the 75th percentile of the ten peer participation rates.
2. The three benchmark views answer different questions. Never average them or create a composite score.
3. `equivalentGapStudents` is not predicted enrollment or a capacity estimate.
4. State-relative readiness z-scores are suitable for state-local comparison but are not raw cross-state test equivalences.
5. A state-local result with exactly ten eligible references after target exclusion is constrained; display that support context to users.
