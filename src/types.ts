export type BenchmarkKey = 'national' | 'stateReadiness' | 'commonAssessment'

export interface NationalBenchmark {
  peerMedianPct: number
  peerP75Pct: number
  gapPp: number
  equivalentGapStudents: number
}

export interface BenchmarkAvailability {
  available: boolean
  status: string
  supportFlag?: string | null
  family?: string | null
}

export interface SchoolSummary {
  id: string
  name: string
  district: string
  state: string
  stateName: string
  city: string
  observedPct: number
  enrollment912: number
  national: NationalBenchmark
  stateReadiness: BenchmarkAvailability
  commonAssessment: BenchmarkAvailability
}

export interface StateOption {
  state: string
  stateName: string
  schoolCount: number
}
