export function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatNumber(num: number | undefined, decimals = 1) {
  if (num === undefined || num === null) return 'N/A'
  return Number(num).toFixed(decimals)
}

export function formatPercent(num: number | undefined) {
  if (num === undefined || num === null) return 'N/A'
  return `${Number(num).toFixed(1)}%`
}

export function formatArea(hectares: number | undefined) {
  if (hectares === undefined || hectares === null) return 'N/A'
  return `${Number(hectares).toFixed(2)} ha`
}

export function riskColor(level: string) {
  switch (level) {
    case 'HIGH': return 'text-red-600 bg-red-50'
    case 'MODERATE': return 'text-orange-600 bg-orange-50'
    case 'LOW': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function healthColor(score: number) {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}
