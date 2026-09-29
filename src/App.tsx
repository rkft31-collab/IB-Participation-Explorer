import { useEffect, useMemo, useRef, useState } from 'react'
import { loadDashboardCore, loadPeerLinks } from './data'
import { formatGap, formatPct, formatStudents } from './format'
import BenchmarkComparison from './BenchmarkComparison'
import PeerCharacteristics from './PeerCharacteristics'
import PeerMap from './PeerMap'
import type { BenchmarkData, BenchmarkKey, PeerLinkMap, School, StateOption } from './types'
import './styles.css'
import './extras.css'

const ALL = 'ALL'
const LABELS: Record<BenchmarkKey, string> = {
  national: 'National Structural',
  stateReadiness: 'State + Readiness',
  commonAssessment: 'Common Assessment',
}

function readQuery() {
  const params = new URLSearchParams(window.location.search)
  const candidate = params.get('benchmark')
  const benchmark: BenchmarkKey = candidate === 'stateReadiness' || candidate === 'commonAssessment' ? candidate : 'national'
  return { schoolId: params.get('school') ?? '', benchmark }
}

function writeQuery(schoolId: string, benchmark: BenchmarkKey, replace = false) {
  const params = new URLSearchParams()
  if (schoolId) params.set('school', schoolId)
  params.set('benchmark', benchmark)
  const url = `${window.location.pathname}?${params.toString()}`
  replace ? window.history.replaceState({}, '', url) : window.history.pushState({}, '', url)
}

function availabilityReason(school: School, key: Exclude<BenchmarkKey, 'national'>) {
  const benchmark = school.benchmarks[key]
  if (benchmark.available) return 'Available for this school.'
  if (benchmark.status === 'target_readiness_missing') return 'Unavailable because this school does not have usable state-readiness data.'
  if (benchmark.status.includes('insufficient')) return 'Unavailable because fewer than 10 eligible peer programs remain under this benchmark.'
  if (benchmark.status.includes('structural')) return 'Unavailable because a required structural matching input is missing.'
  return 'This benchmark is not available for this school.'
}

function benchmarkDescription(key: BenchmarkKey) {
  if (key === 'national') return '10 structurally similar eligible IB schools nationally.'
  if (key === 'stateReadiness') return '10 same-state IB peers matched on structure and state-relative academic readiness.'
  return '10 peers from the retained common-assessment comparison model.'
}

function PeerPlot({ school, peers, benchmark }: { school: School; peers: ReturnType<typeof usePeers>; benchmark: BenchmarkData }) {
  const values = [school.ib.observedPct, ...peers.map((p) => p.ibPct), benchmark.peerP75Pct ?? 0, benchmark.peerMedianPct ?? 0]
  const axisMax = Math.min(100, Math.max(20, Math.ceil(Math.max(...values) / 10) * 10))
  const medianLeft = ((benchmark.peerMedianPct ?? 0) / axisMax) * 100
  const p75Left = ((benchmark.peerP75Pct ?? 0) / axisMax) * 100
  const rows = [
    { id: school.id, name: school.name, state: school.state, pct: school.ib.observedPct, target: true },
    ...peers.map((p) => ({ id: p.peerId, name: p.peerName, state: p.peerState, pct: p.ibPct, target: false })),
  ].sort((a, b) => a.pct - b.pct)

  return <section className="panel chartPanel">
    <div className="sectionHead">
      <div><p className="eyebrow">Participation distribution</p><h3>Your school and its 10 peers</h3></div>
      <p>Median <strong>{formatPct(benchmark.peerMedianPct)}</strong> · P75 <strong>{formatPct(benchmark.peerP75Pct)}</strong></p>
    </div>
    <div className="plot" aria-label="IB participation for the selected school and 10 peers">
      <div className="plotGuides" aria-hidden="true">
        <span className="guide median" style={{ left: `${medianLeft}%` }}><i>Median</i></span>
        <span className="guide p75" style={{ left: `${p75Left}%` }}><i>P75</i></span>
      </div>
      {rows.map((row) => <div className={`plotRow ${row.target ? 'target' : ''}`} key={row.id}>
        <div className="plotLabel"><strong>{row.target ? 'Your school' : row.name}</strong><span>{row.target ? school.stateName : row.state}</span></div>
        <div className="plotTrack"><span className="bar" style={{ width: `${Math.max(1, (row.pct / axisMax) * 100)}%` }} /><b>{formatPct(row.pct)}</b></div>
      </div>)}
      <div className="axis"><span>0%</span><span>{axisMax}%</span></div>
    </div>
  </section>
}

function usePeersPlaceholder() { return [] as { rank: number; peerId: string; peerName: string; peerState: string; ibPct: number; distance: number }[] }
type PeerRows = ReturnType<typeof usePeersPlaceholder>
function usePeers(map: PeerLinkMap | undefined, schoolId: string): PeerRows { return (map?.[schoolId] ?? []) as PeerRows }

export default function App() {
  const initial = useRef(readQuery()).current
  const [schools, setSchools] = useState<School[]>([])
  const [states, setStates] = useState<StateOption[]>([])
  const [selectedState, setSelectedState] = useState(ALL)
  const [query, setQuery] = useState('')
  const [schoolId, setSchoolId] = useState(initial.schoolId)
  const [benchmarkKey, setBenchmarkKey] = useState<BenchmarkKey>(initial.benchmark)
  const [peerMaps, setPeerMaps] = useState<Partial<Record<BenchmarkKey, PeerLinkMap>>>({})
  const [openResults, setOpenResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardCore().then(({ schools: schoolRows, states: stateRows }) => {
      setSchools(schoolRows)
      setStates(stateRows)
      const selected = schoolRows.find((s) => s.id === initial.schoolId)
      if (selected) {
        setSelectedState(selected.state)
        setQuery(selected.name)
        if (initial.benchmark !== 'national' && !selected.benchmarks[initial.benchmark].available) {
          setBenchmarkKey('national')
          writeQuery(selected.id, 'national', true)
        }
      }
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unable to load dashboard data.')).finally(() => setLoading(false))
  }, [initial])

  const school = useMemo(() => schools.find((s) => s.id === schoolId) ?? null, [schools, schoolId])
  const schoolById = useMemo(() => new Map(schools.map((s) => [s.id, s])), [schools])
  const benchmark = school?.benchmarks[benchmarkKey] ?? null

  useEffect(() => {
    if (!school || !benchmark?.available || peerMaps[benchmarkKey]) return
    loadPeerLinks(benchmarkKey).then((map) => setPeerMaps((current) => ({ ...current, [benchmarkKey]: map })))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unable to load peer links.'))
  }, [school, benchmark, benchmarkKey, peerMaps])

  const peers = usePeers(peerMaps[benchmarkKey], schoolId)
  const peerSchools = peers.map((peer) => schoolById.get(peer.peerId)).filter((s): s is School => Boolean(s))
  const filteredSchools = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return schools.filter((s) => selectedState === ALL || s.state === selectedState)
      .filter((s) => !normalized || `${s.name} ${s.district} ${s.city}`.toLowerCase().includes(normalized))
      .slice(0, 12)
  }, [schools, selectedState, query])

  function chooseSchool(next: School, preserveBenchmark = false) {
    let nextBenchmark = preserveBenchmark ? benchmarkKey : 'national'
    if (nextBenchmark !== 'national' && !next.benchmarks[nextBenchmark].available) nextBenchmark = 'national'
    setSchoolId(next.id)
    setSelectedState(next.state)
    setQuery(next.name)
    setBenchmarkKey(nextBenchmark)
    setOpenResults(false)
    writeQuery(next.id, nextBenchmark)
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  function chooseBenchmark(next: BenchmarkKey) {
    if (!school) return
    if (next !== 'national' && !school.benchmarks[next].available) return
    setBenchmarkKey(next)
    writeQuery(school.id, next)
  }

  if (loading) return <main className="shell status">Loading the 950-school research dataset…</main>
  if (error) return <main className="shell status error"><strong>Dashboard data could not load.</strong><br />{error}</main>

  return <main>
    <header className="hero"><div className="shell heroInner">
      <p className="eyebrow">Research prototype · existing IB Diploma Programme schools</p>
      <h1>IB Participation Explorer</h1>
      <p className="dek">Compare an IB school's participation with levels already demonstrated by comparable IB programs.</p>
      <section className="finder" aria-label="Find an IB school">
        <label><span>State</span><select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setOpenResults(true) }}><option value={ALL}>All states</option>{states.map((s) => <option key={s.state} value={s.state}>{s.stateName} ({s.schoolCount})</option>)}</select></label>
        <label className="schoolSearch"><span>School</span><input value={query} onFocus={() => setOpenResults(true)} onChange={(e) => { setQuery(e.target.value); setOpenResults(true) }} placeholder="Search school, district, or city" aria-controls="school-results" />{openResults && <div className="results" id="school-results" role="listbox">{filteredSchools.length ? filteredSchools.map((s) => <button key={s.id} role="option" onClick={() => chooseSchool(s)}><strong>{s.name}</strong><span>{s.city}, {s.state} · {s.district}</span></button>) : <p>No matching IB schools.</p>}</div>}</label>
      </section>
    </div></header>

    <div className="shell content">{!school || !benchmark ? <section className="landing"><p className="eyebrow">950 valid existing IB schools</p><h2>Select a school to explore its peer benchmark.</h2><p>The default comparison uses 10 eligible IB peers. P75 is the 75th percentile of those peer participation rates—not a target of 75% participation.</p></section> : <>
      <section className="schoolHeading"><div><p className="eyebrow">{school.city}, {school.stateName}</p><h2>{school.name}</h2><p>{school.district}</p></div><p className="nces">NCES {school.id}</p></section>
      <nav className="tabs" aria-label="Benchmark view">
        <button className={benchmarkKey === 'national' ? 'active' : ''} onClick={() => chooseBenchmark('national')}>National Structural</button>
        <button className={benchmarkKey === 'stateReadiness' ? 'active' : ''} disabled={!school.benchmarks.stateReadiness.available} title={availabilityReason(school, 'stateReadiness')} onClick={() => chooseBenchmark('stateReadiness')}>State + Readiness</button>
        <button className={benchmarkKey === 'commonAssessment' ? 'active' : ''} disabled={!school.benchmarks.commonAssessment.available} title={availabilityReason(school, 'commonAssessment')} onClick={() => chooseBenchmark('commonAssessment')}>Common Assessment</button>
      </nav>

      <div className="viewIntro"><p><strong>{LABELS[benchmarkKey]}:</strong> {benchmarkDescription(benchmarkKey)}</p>{benchmarkKey === 'stateReadiness' && benchmark.supportFlag && <p className="supportNotice"><strong>Support note:</strong> {benchmark.supportFlag.replaceAll('_', ' ')}.</p>}{benchmarkKey === 'commonAssessment' && benchmark.note && <p className="supportNotice">{benchmark.note}</p>}</div>

      <section className="cards" aria-label={`${LABELS[benchmarkKey]} benchmark snapshot`}>
        <article><span>Current IB participation</span><strong>{formatPct(school.ib.observedPct)}</strong><small>Observed share of grades 9–12 enrollment</small></article>
        <article><span>Peer median</span><strong>{formatPct(benchmark.peerMedianPct)}</strong><small>Middle of this 10-peer participation distribution</small></article>
        <article><span>Peer-achievable P75</span><strong>{formatPct(benchmark.peerP75Pct)}</strong><small>Upper-quartile threshold among these peers</small></article>
        <article><span>Gap to P75</span><strong>{formatGap(benchmark.gapPp)}</strong><small>{(benchmark.gapPp ?? 0) > 0 ? 'Positive means participation is below P75' : 'This school meets or exceeds P75'}</small></article>
      </section>

      <section className="equiv"><div><p className="eyebrow">Equivalent participation gap</p><strong>{formatStudents(benchmark.equivalentGapStudents)}</strong></div><p>This translates the positive observed-to-P75 difference into students using the school's grades 9–12 enrollment ({school.structure.enrollment912.toLocaleString()}). It is a descriptive comparison, not a forecast of future enrollment.</p></section>

      {peers.length === 10 ? <>
        <PeerPlot school={school} peers={peers} benchmark={benchmark} />
        <section className="panel peerTablePanel"><div className="sectionHead"><div><p className="eyebrow">Comparison set</p><h3>Who are the peers?</h3></div><p>Click a school to make it the new target.</p></div>
          <div className="tableWrap"><table><thead><tr><th>Rank</th><th>School</th><th>State</th><th>IB participation</th><th>Enrollment</th><th>FRPL</th><th>Distance</th></tr></thead><tbody>{peers.map((peer) => {
            const peerSchool = schoolById.get(peer.peerId)
            return <tr key={peer.peerId}><td>{peer.rank}</td><td><button className="linkButton" onClick={() => peerSchool && chooseSchool(peerSchool, true)}>{peer.peerName}</button></td><td>{peer.peerState}</td><td>{formatPct(peer.ibPct)}</td><td>{peerSchool?.structure.enrollment912.toLocaleString() ?? '—'}</td><td>{formatPct(peerSchool?.structure.frplPct)}</td><td>{peer.distance.toFixed(2)}</td></tr>
          })}</tbody></table></div>
        </section>
        <div className="twoCol"><PeerMap target={school} peers={peers as any} schoolById={schoolById} /><PeerCharacteristics target={school} peers={peerSchools} benchmark={benchmarkKey} /></div>
      </> : <section className="panel loadingPeers">Loading the 10-peer comparison set…</section>}

      <BenchmarkComparison school={school} />

      <section className="interpret"><h3>What does this comparison suggest?</h3><p>{(benchmark.gapPp ?? 0) > 0 ? `${school.name}'s IB participation is ${(benchmark.gapPp ?? 0).toFixed(1)} percentage points below the peer-achievable P75 for this ${LABELS[benchmarkKey].toLowerCase()} comparison set.` : `${school.name}'s IB participation meets or exceeds the peer-achievable P75 for this ${LABELS[benchmarkKey].toLowerCase()} comparison set.`}</p><p className="method">P75 describes participation already demonstrated by the stronger-performing portion of comparable programs. It is not a causal capacity estimate, forecast, or required participation level.</p></section>

      <details className="methodology"><summary>How are peers selected?</summary><div><p><strong>National Structural:</strong> 10 nearest eligible IB peers using exact charter status, adaptive broad grade configuration, standardized school size, FRPL, Hispanic share, Black share, Asian share, student–teacher ratio, and a soft broad-locale mismatch penalty.</p><p><strong>State + Readiness:</strong> the same structural logic within state, adding state-relative academic readiness as a seventh distance dimension. The benchmark is not shown when fewer than 10 eligible exact-charter references remain.</p><p><strong>Common Assessment:</strong> retained ACT/SAT-family analogs where a defensible common assessment framework is available.</p><p><strong>P75:</strong> the 75th percentile of the 10 peer participation rates. It is an empirical upper-quartile benchmark, not a claim that 75% of students should participate.</p></div></details>
    </>}</div>
    <footer className="shell footer">Frozen research prototype · IB Participation analysis · 2026</footer>
  </main>
}
