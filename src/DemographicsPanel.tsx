import { useState } from 'react'
import type { IbDemographicRow } from './data'
import type { School } from './types'

const pct = (value: number | null) => value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}%`
const pp = (value: number | null) => value == null || !Number.isFinite(value) ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)} pp`

type Row = {
  label: string
  schoolShare: number | null
  ibShare: number | null
  gap: number | null
  withinGroup?: number | null
}

function raceRow(label: string, ibCount: number | null, schoolPct: number | null, school: School): Row {
  const ibTotal = school.ib.enrollment ?? 0
  const ibShare = ibCount != null && ibTotal > 0 ? (ibCount / ibTotal) * 100 : null
  const schoolShare = schoolPct
  const gap = ibShare != null && schoolShare != null ? ibShare - schoolShare : null
  const groupEnrollment = schoolShare != null ? school.structure.enrollment912 * schoolShare / 100 : null
  const withinGroupRaw = ibCount != null && groupEnrollment != null && groupEnrollment > 0 ? ibCount / groupEnrollment * 100 : null
  const withinGroup = withinGroupRaw != null && withinGroupRaw >= 0 && withinGroupRaw <= 100 ? withinGroupRaw : null
  return { label, schoolShare, ibShare, gap, withinGroup }
}

function genderRow(label: string, ibCount: number | null, schoolCount: number | null, row: IbDemographicRow): Row {
  const totalIb = (row[2] ?? 0) + (row[3] ?? 0)
  const totalSchool = (row[4] ?? 0) + (row[5] ?? 0)
  const ibShare = ibCount != null && totalIb > 0 ? ibCount / totalIb * 100 : null
  const schoolShare = schoolCount != null && totalSchool > 0 ? schoolCount / totalSchool * 100 : null
  const gap = ibShare != null && schoolShare != null ? ibShare - schoolShare : null
  return { label, schoolShare, ibShare, gap }
}

export default function DemographicsPanel({ school, data }: { school: School; data: IbDemographicRow | undefined }) {
  const [view, setView] = useState<'race' | 'gender'>('race')
  if (!data) return null

  const raceRows = [
    raceRow('Black students', data[0], school.structure.blackPct, school),
    raceRow('Hispanic / Latino students', data[1], school.structure.hispanicPct, school),
  ]

  const genderRows = [
    genderRow('Male students', data[2], data[4], data),
    genderRow('Female students', data[3], data[5], data),
  ]

  const rows = view === 'race' ? raceRows : genderRows

  return <section className="panel demographicsPanel">
    <div className="sectionHead">
      <div><p className="eyebrow">Who participates in IB?</p><h3>Student representation</h3></div>
      <p>Compare the composition of the school with the students reported in the IB Diploma Programme.</p>
    </div>

    <div className="demoTabs" role="tablist" aria-label="Demographic view">
      <button className={view === 'race' ? 'active' : ''} onClick={() => setView('race')}>Race & ethnicity</button>
      <button className={view === 'gender' ? 'active' : ''} onClick={() => setView('gender')}>Gender</button>
    </div>

    <div className="demoTable">
      <div className={`demoHeader ${view === 'race' ? 'raceHeader' : ''}`}>
        <span>Group</span><span>Share of school</span><span>Share of IB</span><span>Representation gap</span>
        {view === 'race' && <span>Within-group IB participation</span>}
      </div>
      {rows.map((r) => <div className={`demoRow ${view === 'race' ? 'raceRow' : ''}`} key={r.label}>
        <strong>{r.label}</strong>
        <span>{pct(r.schoolShare)}</span>
        <span>{pct(r.ibShare)}</span>
        <span className={r.gap != null && r.gap < 0 ? 'negativeGap' : r.gap != null && r.gap > 0 ? 'positiveGap' : ''}>{pp(r.gap)}</span>
        {view === 'race' && <span>{pct(r.withinGroup ?? null)}</span>}
      </div>)}
    </div>

    <div className="demoNotes">
      <p><strong>Representation gap:</strong> share of IB enrollment minus share of school enrollment. Negative values indicate underrepresentation relative to the school's composition.</p>
      {view === 'race'
        ? <p><strong>Within-group participation:</strong> reported IB students in the group divided by the estimated grades 9–12 enrollment for that group.</p>
        : <p><strong>Gender comparison:</strong> CRDC schoolwide male/female enrollment is used because the public file does not provide a grades 9–12 gender denominator. Nonbinary enrollment is not displayed because the 2023–24 public-use file reports that field as unavailable.</p>}
    </div>
  </section>
}
