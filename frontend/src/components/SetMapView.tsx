import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

interface SetMapViewProps {
  center: [number, number]
  zoom: number
}

export default function SetMapView({ center, zoom }: SetMapViewProps) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}
