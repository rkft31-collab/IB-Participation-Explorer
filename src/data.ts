import type { BenchmarkKey, PeerLinkMap, School, StateOption } from './types'

const dataPath = (name: string) => `${import.meta.env.BASE_URL}data/${name}`

async function loadJson<T>(name: string): Promise<T> {
  const response = await fetch(dataPath(name))
  if (!response.ok) throw new Error(`Unable to load ${name} (${response.status})`)
  return response.json() as Promise<T>
}

let schoolsPromise: Promise<School[]> | undefined
let statesPromise: Promise<StateOption[]> | undefined
const peerPromises = new Map<BenchmarkKey, Promise<PeerLinkMap>>()

export function loadSchools(): Promise<School[]> {
  schoolsPromise ??= loadJson<School[]>('schools.json')
  return schoolsPromise
}

export function loadStates(): Promise<StateOption[]> {
  statesPromise ??= loadJson<StateOption[]>('states.json')
  return statesPromise
}

export function loadPeerLinks(view: BenchmarkKey): Promise<PeerLinkMap> {
  const existing = peerPromises.get(view)
  if (existing) return existing
  const filename = view === 'national'
    ? 'peer-links-national.json'
    : view === 'stateReadiness'
      ? 'peer-links-state-readiness.json'
      : 'peer-links-common-assessment.json'
  const promise = loadJson<PeerLinkMap>(filename)
  peerPromises.set(view, promise)
  return promise
}

export async function loadDashboardCore() {
  const [schools, states] = await Promise.all([loadSchools(), loadStates()])
  return { schools, states }
}
