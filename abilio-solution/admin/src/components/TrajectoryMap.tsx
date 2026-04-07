import { useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, Polyline, useJsApiLoader } from '@react-google-maps/api'
import { snapToRoadsPath } from '../lib/snapToRoads'

const mapContainerStyle = { width: '100%', height: 'min(42vh, 420px)', minHeight: '280px' } as const

export type TrajectoryPoint = {
  latitude: number
  longitude: number
}

function fitMap(map: google.maps.Map, path: google.maps.LatLngLiteral[]) {
  if (path.length === 0) return
  if (path.length === 1) {
    map.setCenter(path[0])
    map.setZoom(15)
    return
  }
  const bounds = new google.maps.LatLngBounds()
  path.forEach((p) => bounds.extend(p))
  map.fitBounds(bounds, 48)
}

type TrajectoryMapProps = {
  points: TrajectoryPoint[]
}

export function TrajectoryMap({ points }: TrajectoryMapProps) {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim()
  if (!apiKey) {
    return (
      <div className="map-placeholder map-fallback">
        <p>
          Configure <code>VITE_GOOGLE_MAPS_API_KEY</code> no arquivo <code>.env</code> (Maps JavaScript API + Roads
          API) para exibir a trajetória alinhada às ruas no Google Maps.
        </p>
      </div>
    )
  }
  return <TrajectoryMapInner points={points} apiKey={apiKey} />
}

function TrajectoryMapInner({ points, apiKey }: { points: TrajectoryPoint[]; apiKey: string }) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const [roadPath, setRoadPath] = useState<google.maps.LatLngLiteral[] | null>(null)
  const [snapNote, setSnapNote] = useState<string | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'admin-trajectory-map',
    googleMapsApiKey: apiKey,
  })

  const rawPath = useMemo(
    () => points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
    [points],
  )

  const displayPath = roadPath ?? rawPath

  useEffect(() => {
    setRoadPath(null)
    setSnapNote(null)

    if (rawPath.length < 2) {
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const snapped = await snapToRoadsPath(rawPath, apiKey)
        if (!cancelled && snapped.length >= 2) {
          setRoadPath(snapped)
        }
      } catch {
        if (!cancelled) {
          setSnapNote('Trajetória em linha reta entre pontos. Ative Roads API no projeto da chave para seguir ruas.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rawPath, apiKey])

  useEffect(() => {
    const map = mapRef.current
    if (!map || displayPath.length === 0) return
    fitMap(map, displayPath)
  }, [displayPath])

  if (loadError) {
    return <div className="map-placeholder map-fallback">Não foi possível carregar o Google Maps.</div>
  }

  if (!isLoaded) {
    return <div className="map-placeholder">Carregando mapa…</div>
  }

  if (rawPath.length === 0) {
    return <div className="map-placeholder">Nenhum ponto para desenhar a trajetória.</div>
  }

  const center = displayPath[Math.floor(displayPath.length / 2)] ?? displayPath[0]

  // Remount map + polyline when switching raw → snapped (or on path identity change).
  // Otherwise @react-google-maps/api can leave a stale polyline overlay on the map.
  const mapInstanceKey = `${roadPath != null ? 'snapped' : 'raw'}-${rawPath.length}-${displayPath.length}`

  return (
    <div className="trajectory-map-wrap">
      {snapNote && <p className="map-snap-note">{snapNote}</p>}
      <GoogleMap
        key={mapInstanceKey}
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={(map) => {
          mapRef.current = map
          fitMap(map, displayPath)
        }}
        onUnmount={() => {
          mapRef.current = null
        }}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <Polyline
          key={mapInstanceKey}
          path={displayPath}
          options={{
            strokeColor: '#1d4ed8',
            strokeOpacity: 0.95,
            strokeWeight: 4,
            geodesic: false,
          }}
        />
      </GoogleMap>
    </div>
  )
}
