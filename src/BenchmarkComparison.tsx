import type { School } from './types'
import { formatGap, formatPct } from './format'

export default function BenchmarkComparison({ school }: { school: School }) {
  const rows = [
    ['National Structural', school.benchmarks.national],
    ['State + Readiness', school.benchmarks.stateReadiness],
    ['Common Assessment', school.benchmarks.commonAssessment],
  ] as const
  const available = rows.filter(([, b]) => b.available)
  if (available.length < 2) return null

  return <section className="panel benchmarkCompare">
    <div className="sectionHead"><div><p className="eyebrow">Cross-benchmark view</p><h3>How does the conclusion change?</h3></div><p>Each row is a separate estimand; they are not averaged.</p></div>
    <div className="tableWrap"><table><thead><tr><th>Benchmark</th><th>Observed</th><th>Peer P75</th><th>Gap</th></tr></thead><tbody>
      {available.map(([label, b]) => <tr key={label}><td><strong>{label}</strong></td><td>{formatPct(school.ib.observedPct)}</td><td>{formatPct(b.peerP75Pct)}</td><td>{formatGap(b.gapPp)}</td></tr>)}
    </tbody></table></div>
    <p className="method">Differences across rows show sensitivity to how “peer” is defined: national structure, state-local structure plus readiness, or a retained common-assessment analog.</p>
  </section>
}
