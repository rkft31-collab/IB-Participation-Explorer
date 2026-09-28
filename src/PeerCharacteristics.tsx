import type { BenchmarkKey, School } from './types'

type DisplayType = 'count' | 'percent' | 'ratio' | 'z'
type CharacteristicRow = { label: string; target: number | null; peers: number | null; type: DisplayType }

function median(values: Array<number | null | undefined>) {
  const clean = values.filter((value): value is number => Number.isFinite(value)).sort((a, b) => a - b)
  if (!clean.length) return null
  const middle = Math.floor(clean.length / 2)
  return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2
}

function display(value: number | null, type: DisplayType) {
  if (value == null) return '—'
  if (type === 'count') return Math.round(value).toLocaleString()
  if (type === 'percent') return `${value.toFixed(1)}%`
  if (type === 'z') return value.toFixed(2)
  return value.toFixed(1)
}

export default function PeerCharacteristics({ target, peers, benchmark }: { target: School; peers: School[]; benchmark: BenchmarkKey }) {
  const rows: CharacteristicRow[] = [
    { label: 'Grades 9–12 enrollment', target: target.structure.enrollment912, peers: median(peers.map((s) => s.structure.enrollment912)), type: 'count' },
    { label: 'FRPL', target: target.structure.frplPct, peers: median(peers.map((s) => s.structure.frplPct)), type: 'percent' },
    { label: 'Hispanic share', target: target.structure.hispanicPct, peers: median(peers.map((s) => s.structure.hispanicPct)), type: 'percent' },
    { label: 'Black share', target: target.structure.blackPct, peers: median(peers.map((s) => s.structure.blackPct)), type: 'percent' },
    { label: 'Asian share', target: target.structure.asianPct, peers: median(peers.map((s) => s.structure.asianPct)), type: 'percent' },
    { label: 'Student–teacher ratio', target: target.structure.studentTeacherRatio, peers: median(peers.map((s) => s.structure.studentTeacherRatio)), type: 'ratio' },
  ]

  if (benchmark === 'stateReadiness') {
    rows.push({ label: 'State readiness z', target: target.readiness.stateZ, peers: median(peers.map((s) => s.readiness.stateZ)), type: 'z' })
  }

  return <section className="panel characteristics">
    <div className="sectionHead">
      <div><p className="eyebrow">Matching context</p><h3>Why these are peers</h3></div>
      <p>Target values compared with the median of the selected peer set.</p>
    </div>
    <div className="characteristicGrid" role="table" aria-label="Target and peer matching characteristics">
      <div className="characteristicHeader" role="row"><span>Characteristic</span><span>Your school</span><span>Peer median</span></div>
      {rows.map((row) => <div className="characteristicRow" role="row" key={row.label}>
        <strong>{row.label}</strong><span>{display(row.target, row.type)}</span><span>{display(row.peers, row.type)}</span>
      </div>)}
    </div>
    <p className="method">These descriptive values help explain the comparison set. The actual peer-selection model uses standardized distance, not raw differences shown in this table.</p>
  </section>
}
