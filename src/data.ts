import type { SchoolSummary, StateOption } from './types'

type SchoolRow = [string,string,string,string,string,string,number,number,number,number,number,number,number,string,string|null,number,string,string|null]
const path = (name:string) => `${import.meta.env.BASE_URL}data/${name}`

async function json<T>(name:string):Promise<T>{
  const r=await fetch(path(name))
  if(!r.ok) throw new Error(`Unable to load ${name}`)
  return r.json() as Promise<T>
}

function rowToSchool(r:SchoolRow):SchoolSummary{
  return {
    id:r[0],name:r[1],district:r[2],state:r[3],stateName:r[4],city:r[5],observedPct:r[6],enrollment912:r[7],
    national:{peerMedianPct:r[8],peerP75Pct:r[9],gapPp:r[10],equivalentGapStudents:r[11]},
    stateReadiness:{available:Boolean(r[12]),status:r[13],supportFlag:r[14]},
    commonAssessment:{available:Boolean(r[15]),status:r[16],family:r[17]}
  }
}

let schoolPromise:Promise<SchoolSummary[]>|undefined
export function loadSchools(){
  schoolPromise ??= Promise.all(
    Array.from({length:10},(_,i)=>json<SchoolRow[]>(`schools-p1-${i}.json`))
  ).then(parts=>parts.flat().map(rowToSchool))
  return schoolPromise
}

export async function loadStates():Promise<StateOption[]>{
  const schools=await loadSchools()
  const m=new Map<string,StateOption>()
  for(const s of schools){
    const x=m.get(s.state)
    if(x) x.schoolCount++
    else m.set(s.state,{state:s.state,stateName:s.stateName,schoolCount:1})
  }
  return [...m.values()].sort((a,b)=>a.stateName.localeCompare(b.stateName))
}
