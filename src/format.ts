export const formatPct = (value: number | null | undefined) => value == null ? '—' : `${value.toFixed(1)}%`
export const formatGap = (value: number | null | undefined) => value == null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)} pp`
export const formatStudents = (value: number | null | undefined) => value == null ? '—' : `≈ ${Math.round(value).toLocaleString()} students`
