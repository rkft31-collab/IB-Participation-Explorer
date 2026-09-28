# Methodology Notes for the Dashboard

The dashboard is a presentation layer for a frozen research model. It must **explain the analysis, not silently alter it**.

## National structural benchmark
For each valid existing IB school, select 10 nearest eligible valid IB peers nationally using:
- exact charter status;
- adaptive broad grade configuration (relax only when needed and flag it);
- standardized distance on log grades 9-12 enrollment, FRPL, Hispanic share, Black share, Asian share, and winsorized student-teacher ratio;
- a soft 0.5 standardized-distance penalty for broad locale mismatch.

Primary descriptive benchmark: P75 of the ten peer participation rates.

## State + readiness benchmark
Use only where K=10 is supportable under current frozen rules:
- same state;
- exact charter status;
- adaptive grade configuration;
- the six structural dimensions above;
- within-state readiness z as a seventh equal-unit distance dimension;
- 0.5 broad-locale mismatch penalty.

Do not force a result when fewer than ten eligible references remain.

## Common-assessment benchmark
Display only the exact frozen target-level result retained by the analysis:
- strict ACT-family v5 where available;
- exact saved Indiana SAT-family pilot where available.

Do not synthesize missing SAT target results for Colorado, Illinois, or Michigan.

## P75 language
Preferred UI wording: **Peer-achievable P75**.
Tooltip definition: "The 75th percentile of participation among this school's 10 comparison programs. It represents participation already demonstrated by the stronger-performing portion of comparable programs; it is not a forecast or capacity ceiling."

## Equivalent participation gap language
Preferred label: **Equivalent participation gap**.
Preferred explanation: "If the school's participation matched its peer P75, the percentage-point difference would correspond to approximately this many grades 9-12 students. This is a descriptive translation, not a forecast of future enrollment."

## Never do these in the interface
- Do not call the result a causal effect.
- Do not label a school "failing" or "low-performing."
- Do not average national, state-readiness, and common-assessment P75s.
- Do not hide support/constraint flags.
- Do not replace a missing benchmark with another benchmark without making the view change explicit.
