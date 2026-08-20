export interface GeoJsonGeometry {
  type: string
  coordinates: number[][][] | number[][][][]
}

export function parseGeoJson(input: string | GeoJsonGeometry | null | undefined): GeoJsonGeometry | null {
  if (!input) return null
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return (parsed.geometry || parsed) as GeoJsonGeometry
    } catch {
      return null
    }
  }
  return input
}

export function polygonRingAreaHectares(coords: number[][]): number | null {
  if (!coords || coords.length < 4) return null
  const R = 6378137
  const d2r = Math.PI / 180
  let area = 0
  const n = coords.length - 1
  for (let i = 0; i < n; i++) {
    const p1 = coords[i]
    const p2 = coords[i + 1]
    area += (p2[0] - p1[0]) * d2r * (2 + Math.sin(p1[1] * d2r) + Math.sin(p2[1] * d2r))
  }
  area = (area * R * R) / 2
  return Math.abs(area) / 10000
}

export function calculatePolygonAreaHectares(geojson: string | GeoJsonGeometry | null | undefined): number | null {
  const geom = parseGeoJson(geojson)
  if (!geom) return null
  const type = geom.type
  if (type === 'Polygon') {
    const ring = Array.isArray(geom.coordinates[0]) ? geom.coordinates[0] : []
    return polygonRingAreaHectares(ring as number[][])
  }
  if (type === 'MultiPolygon') {
    let total = 0
    let hasArea = false
    for (const poly of geom.coordinates) {
      const ring = Array.isArray(poly[0]) ? poly[0] : []
      const a = polygonRingAreaHectares(ring as number[][])
      if (a !== null) {
        total += a
        hasArea = true
      }
    }
    return hasArea ? total : null
  }
  return null
}

export function getPolygonCenter(geojson: string | GeoJsonGeometry | null | undefined): [number, number] | null {
  const geom = parseGeoJson(geojson)
  if (!geom || !['Polygon', 'MultiPolygon'].includes(geom.type)) return null
  let sumX = 0
  let sumY = 0
  let count = 0
  const rings = geom.type === 'Polygon' ? [geom.coordinates[0]] : geom.coordinates.map((p: any) => p[0])
  for (const ring of rings) {
    for (const pt of ring) {
      sumX += pt[0]
      sumY += pt[1]
      count++
    }
  }
  if (count === 0) return null
  return [sumY / count, sumX / count]
}

export function getPolygonBounds(geojson: string | GeoJsonGeometry | null | undefined): [[number, number], [number, number]] | null {
  const geom = parseGeoJson(geojson)
  if (!geom || !['Polygon', 'MultiPolygon'].includes(geom.type)) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const rings = geom.type === 'Polygon' ? [geom.coordinates[0]] : geom.coordinates.map((p: any) => p[0])
  const update = (pt: number[]) => {
    minX = Math.min(minX, pt[0])
    minY = Math.min(minY, pt[1])
    maxX = Math.max(maxX, pt[0])
    maxY = Math.max(maxY, pt[1])
  }
  for (const ring of rings) {
    for (const pt of ring) update(pt)
  }
  return [
    [minY, minX],
    [maxY, maxX],
  ]
}
