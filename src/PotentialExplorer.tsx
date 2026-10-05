import { useMemo, useState, useEffect } from 'react'
import type { School } from './types'
import { formatPct } from './format'

type NonIbRow = [
  string,string,string,string,string,string,number,
  number|null,number|null,number|null,number|null,number|null,
  string,string,string,number|null,number|null,number|null,number|null,boolean,
  string[],string|null,boolean,number|null,string|null,number|null
]

type NonIbData = { s: string[]; r: NonIbRow[] }

const dataPath = (name:string) => `${import.meta.env.BASE_URL}data/nonib/${name}`
async function loadPotentialData(): Promise<NonIbData> {
  const r = await fetch(dataPath('nonib-schools.b64.txt'))
  if (!r.ok) throw new Error('Unable to load potential-program data.')
  const b64 = await r.text()
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  const text = await new Response(stream).text()
  return JSON.parse(text) as NonIbData
}

const pct = (v:number|null|undefined) => v == null ? '—' : `${v.toFixed(1)}%`
const nstudents = (v:number|null|undefined) => v == null ? '—' : `≈ ${Math.round(v).toLocaleString()} students`

export default function PotentialExplorer({ ibSchools, onExistingMode }:{ ibSchools:School[]; onExistingMode:()=>void }) {
  const [data,setData] = useState<NonIbData|null>(null)
  const [error,setError] = useState('')
  const [state,setState] = useState('ALL')
  const [query,setQuery] = useState('')
  const [selected,setSelected] = useState<NonIbRow|null>(null)
  const [open,setOpen] = useState(false)

  useEffect(()=>{ loadPotentialData().then((loaded)=> {
    setData(loaded)
    const params = new URLSearchParams(window.location.search)
    const requested = params.get('mode') === 'potential' ? params.get('school') : null
    if (requested) {
      const found = loaded.r.find(r => r[0] === requested)
      if (found) { setSelected(found); setState(found[1]); setQuery(found[3]) }
    }
  }).catch(e=>setError(e instanceof Error?e.message:'Unable to load data.')) },[])

  const peerById = useMemo(()=>new Map(ibSchools.map(s=>[s.id,s])),[ibSchools])
  const stateOptions = useMemo(()=>{
    if(!data) return [] as {code:string;name:string;count:number}[]
    const m = new Map<string,{name:string;count:number}>()
    data.r.forEach(r=>{ const x=m.get(r[1]); m.set(r[1],{name:r[2],count:(x?.count??0)+1}) })
    return [...m.entries()].map(([code,v])=>({code,...v})).sort((a,b)=>a.name.localeCompare(b.name))
  },[data])
  const matches = useMemo(()=>{
    if(!data) return []
    const q=query.trim().toLowerCase()
    return data.r.filter(r=>(state==='ALL'||r[1]===state) && (!q || `${r[3]} ${r[4]} ${r[5]}`.toLowerCase().includes(q))).slice(0,15)
  },[data,state,query])

  if(error) return <main><div className="shell status error">{error}</div></main>

  const peers = selected ? selected[20].map(id=>peerById.get(id)).filter((x):x is School=>Boolean(x)) : []
  const enrollment = selected?.[6] ?? null
  const typicalRate = selected?.[17] ?? null
  const upperRate = selected?.[18] ?? null
  const typicalScale = enrollment!=null && typicalRate!=null ? enrollment*typicalRate/100 : null
  const upperScale = enrollment!=null && upperRate!=null ? enrollment*upperRate/100 : null
  const peerSizes = peers.map(p=>p.ib.enrollment).filter((x):x is number=>x!=null).sort((a,b)=>a-b)
  const peerMin = peerSizes.length ? peerSizes[0] : null
  const peerMax = peerSizes.length ? peerSizes[peerSizes.length-1] : null

  function choose(r:NonIbRow){
    setSelected(r); setState(r[1]); setQuery(r[3]); setOpen(false)
    const u=new URL(window.location.href);u.search='';u.searchParams.set('mode','potential');u.searchParams.set('school',r[0]);window.history.pushState({},'',u)
    window.scrollTo({top:300,behavior:'smooth'})
  }

  return <main>
    <header className="hero"><div className="shell heroInner">
      <p className="eyebrow">Research prototype · potential IB Diploma Programme schools</p>
      <h1>IB Participation Explorer</h1>
      <p className="dek">Explore non-IB high schools and the program scale already demonstrated by structurally similar IB schools.</p>
      <div className="modeSwitch"><button onClick={onExistingMode}>Existing IB programs</button><button className="active">Potential IB programs</button></div>
      <section className="finder" aria-label="Find a non-IB school">
        <label><span>State</span><select value={state} onChange={e=>{setState(e.target.value);setQuery('');setSelected(null);setOpen(true)}}><option value="ALL">All states</option>{stateOptions.map(s=><option key={s.code} value={s.code}>{s.name} ({s.count.toLocaleString()})</option>)}</select></label>
        <label className="schoolSearch"><span>School</span><input value={query} onFocus={e=>{setOpen(true);if(selected&&query===selected[3])e.currentTarget.select()}} onChange={e=>{setQuery(e.target.value);setOpen(true)}} placeholder={data?'Search school, district, or city':'Loading 17,827 candidate schools…'} disabled={!data}/>{open&&data&&<div className="results" role="listbox">{matches.length?matches.map(r=><button key={r[0]} onClick={()=>choose(r)}><strong>{r[3]}</strong><span>{r[5]}, {r[1]} · {r[4]}</span></button>):<p>No matching non-IB schools.</p>}</div>}</label>
      </section>
    </div></header>

    <div className="shell content">
      {!selected ? <section className="landing"><p className="eyebrow">17,827 structurally standard non-IB high schools</p><h2>Select a school to explore potential IB program scale.</h2><p>The comparison uses the same frozen national structural model as the existing-program analysis: 10 eligible IB peers matched on school structure and demographics.</p></section> : <>
        <section className="schoolHeading"><div><p className="eyebrow">{selected[5]}, {selected[2]}</p><h2>{selected[3]}</h2><p>{selected[4]}</p></div><p className="nces">NCES {selected[0]}</p></section>
        <div className="viewIntro"><p><strong>Potential-program view:</strong> this school does not currently report an IB Diploma Programme in the CRDC data. The figures below describe program sizes demonstrated by comparable existing IB schools; they are not forecasts or guarantees.</p></div>

        <section className="cards potentialCards">
          <article><span>Typical peer participation</span><strong>{pct(typicalRate)}</strong><small>Median IB participation among the 10 matched programs</small></article>
          <article><span>Typical peer scale</span><strong>{nstudents(typicalScale)}</strong><small>Typical peer rate applied to this school's grades 9–12 enrollment</small></article>
          <article><span>Upper-peer benchmark</span><strong>{pct(upperRate)}</strong><small>75th percentile among the 10 matched IB programs</small></article>
          <article><span>Upper-peer program scale</span><strong>{nstudents(upperScale)}</strong><small>Upper-peer rate applied to {enrollment?.toLocaleString()} grades 9–12 students</small></article>
        </section>

        <section className="panel potentialSummary">
          <div className="sectionHead"><div><p className="eyebrow">Peer-demonstrated scale</p><h3>What have comparable IB schools sustained?</h3></div><p>Observed program enrollment among the matched IB peers ranges from <strong>{peerMin?.toLocaleString()??'—'}</strong> to <strong>{peerMax?.toLocaleString()??'—'}</strong> students.</p></div>
          <div className="potentialFacts">
            <div><span>School enrollment</span><strong>{enrollment?.toLocaleString()}</strong></div>
            <div><span>Academic readiness</span><strong>{selected[22] ? (selected[23]!=null ? `${selected[23]}th percentile` : selected[21]??'Available') : 'Structural-only'}</strong><small>{selected[22] ? `${selected[21]??'Readiness'} state-relative measure` : 'No usable readiness layer in the national master'}</small></div>
            <div><span>Grade configuration</span><strong>{selected[12]}</strong></div>
            <div><span>Locale</span><strong>{selected[14]}</strong></div>
          </div>
        </section>

        <section className="panel peerTablePanel"><div className="sectionHead"><div><p className="eyebrow">Established analogs</p><h3>The 10 matched IB programs</h3></div><p>These are the exact peers from the frozen national structural model.</p></div>
          <div className="tableWrap"><table><thead><tr><th>Rank</th><th>IB school</th><th>State</th><th>IB participation</th><th>IB students</th><th>Enrollment</th><th>FRPL</th></tr></thead><tbody>
            {peers.map((p,i)=><tr key={p.id}><td>{i+1}</td><td>{p.name}</td><td>{p.state}</td><td>{formatPct(p.ib.observedPct)}</td><td>{p.ib.enrollment?.toLocaleString()??'—'}</td><td>{p.structure.enrollment912.toLocaleString()}</td><td>{formatPct(p.structure.frplPct)}</td></tr>)}
          </tbody></table></div>
        </section>

        <section className="panel characteristicsPanel"><div className="sectionHead"><div><p className="eyebrow">Why these schools?</p><h3>Target-school characteristics</h3></div><p>Peer matching also uses these dimensions when selecting the 10 established IB analogs.</p></div>
          <div className="potentialFacts">
            <div><span>FRPL</span><strong>{pct(selected[7]!=null?selected[7]*100:null)}</strong></div>
            <div><span>Hispanic / Latino</span><strong>{pct(selected[8]!=null?selected[8]*100:null)}</strong></div>
            <div><span>Black</span><strong>{pct(selected[9]!=null?selected[9]*100:null)}</strong></div>
            <div><span>Asian</span><strong>{pct(selected[10]!=null?selected[10]*100:null)}</strong></div>
            <div><span>Student–teacher ratio</span><strong>{selected[11]?.toFixed(1)??'—'}</strong></div>
            <div><span>Charter status</span><strong>{selected[13]}</strong></div>
          </div>
        </section>

        <details className="methodology"><summary>How should I interpret the potential-program estimate?</summary><div><p><strong>Typical peer scale</strong> applies the median participation rate among the school's 10 matched IB programs to the target school's grades 9–12 enrollment.</p><p><strong>Upper-peer program scale</strong> applies the 75th-percentile peer participation rate. It represents a strong level already demonstrated among comparable programs, not a prediction of how many students would enroll if IB were introduced.</p><p>The initial potential-program view uses the frozen <strong>national structural</strong> comparison. Academic-readiness information is shown as context where available but is not silently blended into this national benchmark.</p></div></details>
      </>}
    </div>
    <footer className="shell footer">Frozen research prototype · IB Participation analysis · 2026</footer>
  </main>
}
