export type BenchmarkKey = 'national' | 'stateReadiness' | 'commonAssessment'

export interface StructureData {
  charter: string
  gradeConfig: string
  localeBroad: string
  localeLabel: string
  enrollment912: number
  frplPct: number | null
  hispanicPct: number | null
  blackPct: number | null
  asianPct: number | null
  studentTeacherRatio: number | null
}

export interface ReadinessData {
  tier: string
  available: boolean
  stateZ: number | null
  statePercentile: number | null
  source: string | null
  qualityFlag: string | null
  cautionFlag: string | null
}

export interface BenchmarkData {
  available: boolean
  status: string
  peerMedianPct: number | null
  peerP75Pct: number | null
  gapPp: number | null
  equivalentGapStudents: number | null
  peerIds: string[]
  gradeRelaxed?: boolean | null
  eligibleReferenceCount?: number
  supportFlag?: string | null
  meanDistance5?: number | null
  meanPeerDistance?: number | null
  family?: string | null
  metric?: string | null
  raw?: number | null
  poolZ?: number | null
  view?: string | null
  note?: string | null
}

export interface School {
  id: string
  name: string
  district: string
  state: string
  stateName: string
  city: string
  zip: string
  location: { lat: number; lon: number }
  structure: StructureData
  ib: { enrollment: number | null; observedPct: number }
  readiness: ReadinessData
  benchmarks: {
    national: BenchmarkData
    stateReadiness: BenchmarkData
    commonAssessment: BenchmarkData
  }
}

export interface PeerLink {
  rank: number
  peerId: string
  peerName: string
  peerState: string
  ibPct: number
  distance: number
  sameLocale: boolean
  sameState: boolean
  targetReadinessZ: number | null
  peerReadinessZ: number | null
  gradeRelaxed: boolean
  sourceView: string
}

export type PeerLinkMap = Record<string, PeerLink[]>

export interface StateOption {
  state: string
  stateName: string
  schoolCount: number
  stateReadinessBenchmarkCount?: number
  commonAssessmentBenchmarkCount?: number
}
