# Frozen dashboard data

This directory must contain the presentation-layer JSON generated from the frozen IB Participation analysis:

- `schools.json` — 950 valid existing IB schools, coordinates, matching characteristics, and benchmark summaries.
- `states.json` — state selector metadata.
- `school-index.json` — compact search index.
- `peer-links-national.json` — 9,500 national structural peer links.
- `peer-links-state-readiness.json` — 7,320 state + readiness peer links.
- `peer-links-common-assessment.json` — 520 exact retained common-assessment peer links.
- `metadata.json` — dataset version and interpretation metadata.

These files are frozen research-derived presentation assets. Do not edit analytical values by hand and do not recalculate peers in the browser.

The source package dated 2026-09-27 validates to: 950 schools, 9,500 national links, 732 state-readiness targets, 52 common-assessment targets, and coordinates for all 950 schools.
