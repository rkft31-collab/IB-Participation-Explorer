import { useEffect, useMemo, useRef, useState } from 'react'
import { loadSchools, loadStates } from './data'
import { formatGap, formatPct, formatStudents } from './format'
import type { BenchmarkKey, SchoolSummary, StateOption } from './types'
import './styles.css'

const ALL='ALL'

function queryState(){
  const p=new URLSearchParams(location.search)
  const b=p.get('benchmark')
  return {
    school:p.get('school')??'',
    benchmark:(b==='stateReadiness'||b==='commonAssessment'?b:'national') as BenchmarkKey,
  }
}

function setUrl(school:string,benchmark:BenchmarkKey){
  const p=new URLSearchParams()
  if(school)p.set('school',school)
  p.set('benchmark',benchmark)
  history.pushState({},'',`${location.pathname}?${p}`)
}

function reason(s:SchoolSummary,k:'stateReadiness'|'commonAssessment'){
  const b=s[k]
  if(b.available)return 'Available for this school.'
  if(b.status==='target_readiness_missing')return 'Unavailable because usable state-readiness data are missing.'
  if(b.status.includes('insufficient'))return 'Unavailable because fewer than 10 eligible peers remain.'
  return 'This benchmark is not available for this school.'
}

export default function App(){
  const initial=useRef(queryState()).current
  const [schools,setSchools]=useState<SchoolSummary[]>([])
  const [states,setStates]=useState<StateOption[]>([])
  const [state,setState]=useState(ALL)
  const [q,setQ]=useState('')
  const [schoolId,setSchoolId]=useState(initial.school)
  const [benchmark,setBenchmark]=useState<BenchmarkKey>(initial.benchmark)
  const [open,setOpen]=useState(false)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{
    Promise.all([loadSchools(),loadStates()]).then(([ss,st])=>{
      setSchools(ss);setStates(st)
      const s=ss.find(x=>x.id===initial.school)
      if(s){
        setState(s.state);setQ(s.name)
        if(initial.benchmark!=='national'&&!s[initial.benchmark].available)setBenchmark('national')
      }
    }).catch(e=>setError(e instanceof Error?e.message:'Unable to load data')).finally(()=>setLoading(false))
  },[initial])

  const school=useMemo(()=>schools.find(s=>s.id===schoolId)??null,[schools,schoolId])
  const results=useMemo(()=>{
    const n=q.trim().toLowerCase()
    return schools.filter(s=>(state===ALL||s.state===state)&&(!n||`${s.name} ${s.district} ${s.city}`.toLowerCase().includes(n))).slice(0,12)
  },[schools,state,q])

  function choose(s:SchoolSummary){
    setSchoolId(s.id);setState(s.state);setQ(s.name);setBenchmark('national');setOpen(false);setUrl(s.id,'national')
  }

  function chooseBenchmark(b:BenchmarkKey){
    if(!school)return
    if(b!=='national'&&!school[b].available)return
    setBenchmark(b);setUrl(school.id,b)
  }

  if(loading)return <main className="shell status">Loading the 950-school research dataset…</main>
  if(error)return <main className="shell status error">{error}</main>

  return <main>
    <header className="hero"><div className="shell heroInner">
      <p className="eyebrow">Research prototype · existing IB Diploma Programme schools</p>
      <h1>IB Participation Explorer</h1>
      <p className="dek">Compare an IB school's participation with levels already demonstrated by structurally similar IB programs.</p>
      <section className="finder" aria-label="Find an IB school">
        <label><span>State</span><select value={state} onChange={e=>{setState(e.target.value);setOpen(true)}}><option value={ALL}>All states</option>{states.map(x=><option key={x.state} value={x.state}>{x.stateName} ({x.schoolCount})</option>)}</select></label>
        <label className="schoolSearch"><span>School</span><input value={q} onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value);setOpen(true)}} placeholder="Search school, district, or city" aria-controls="school-results" />{open&&<div className="results" id="school-results">{results.length?results.map(s=><button key={s.id} onClick={()=>choose(s)}><strong>{s.name}</strong><span>{s.city}, {s.state} · {s.district}</span></button>):<p>No matching IB schools.</p>}</div>}</label>
      </section>
    </div></header>

    <div className="shell content">{!school?
      <section className="landing"><p className="eyebrow">950 valid existing IB schools</p><h2>Select a school to explore its peer benchmark.</h2><p>The national comparison uses 10 eligible IB peers. The peer-achievable P75 is the 75th percentile of those peers' participation rates—not a target of 75% participation.</p></section>
      :<>
        <section className="schoolHeading"><div><p className="eyebrow">{school.city}, {school.stateName}</p><h2>{school.name}</h2><p>{school.district}</p></div><p className="nces">NCES {school.id}</p></section>
        <nav className="tabs" aria-label="Benchmark view">
          <button className={benchmark==='national'?'active':''} onClick={()=>chooseBenchmark('national')}>National Structural</button>
          <button className={benchmark==='stateReadiness'?'active':''} disabled={!school.stateReadiness.available} title={reason(school,'stateReadiness')} onClick={()=>chooseBenchmark('stateReadiness')}>State + Readiness</button>
          <button className={benchmark==='commonAssessment'?'active':''} disabled={!school.commonAssessment.available} title={reason(school,'commonAssessment')} onClick={()=>chooseBenchmark('commonAssessment')}>Common Assessment</button>
        </nav>
        {benchmark!=='national'?
          <section className="note"><strong>{benchmark==='stateReadiness'?'State + Readiness':'Common Assessment'} is available for this school.</strong><p>The detailed peer view is scheduled for Phase 4. Phase 1 keeps National Structural as the complete reference display.</p><button onClick={()=>chooseBenchmark('national')}>Return to National Structural</button></section>
          :<>
            <section className="cards" aria-label="National structural benchmark snapshot">
              <article><span>Current IB participation</span><strong>{formatPct(school.observedPct)}</strong><small>Observed share of grades 9–12 enrollment</small></article>
              <article><span>Peer median</span><strong>{formatPct(school.national.peerMedianPct)}</strong><small>Middle of the 10-peer distribution</small></article>
              <article><span>Peer-achievable P75</span><strong>{formatPct(school.national.peerP75Pct)}</strong><small>Upper-quartile threshold among peers</small></article>
              <article><span>Gap to P75</span><strong>{formatGap(school.national.gapPp)}</strong><small>{school.national.gapPp>0?'Positive means participation is below P75':'This school meets or exceeds P75'}</small></article>
            </section>
            <section className="equiv"><div><p className="eyebrow">Equivalent participation gap</p><strong>{formatStudents(school.national.equivalentGapStudents)}</strong></div><p>This translates the positive observed-to-P75 difference into students using the school's grades 9–12 enrollment ({school.enrollment912.toLocaleString()}). It is descriptive, not a forecast.</p></section>
            <section className="interpret"><h3>What does this comparison suggest?</h3><p>{school.national.gapPp>0?`${school.name}'s IB participation is ${school.national.gapPp.toFixed(1)} percentage points below the peer-achievable P75 for its national structural comparison set.`:`${school.name}'s IB participation meets or exceeds the peer-achievable P75 for its national structural comparison set.`}</p><p className="method">P75 describes participation already demonstrated by the stronger-performing portion of comparable programs. It is not a causal capacity estimate or required participation level.</p></section>
          </>}
      </>}
    </div>
    <footer className="shell footer">Frozen research prototype · IB Participation analysis · 2026</footer>
  </main>
}
