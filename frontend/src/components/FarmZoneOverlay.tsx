import { Polygon, Tooltip } from 'react-leaflet'
import { Zone } from '../types'

interface FarmZoneOverlayProps {
  zones: Zone[]
}

function getZoneColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

export default function FarmZoneOverlay({ zones }: FarmZoneOverlayProps) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Healthy (75-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-600">Moderate (50-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">Critical (0-49)</span>
        </div>
      </div>
      {zones.map((zone, index) => (
        <Polygon
          key={index}
          positions={zone.positions}
          pathOptions={{
            color: getZoneColor(zone.healthScore),
            fillColor: getZoneColor(zone.healthScore),
            fillOpacity: 0.3,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div className="rounded-md bg-white px-2 py-1 text-sm shadow-md">
              <p className="font-semibold">{zone.label}</p>
              <p className="text-gray-600">Health Score: {zone.healthScore}</p>
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </div>
  )
}
