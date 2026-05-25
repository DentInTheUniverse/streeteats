'use client'

import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import type { LatLng } from '@/lib/geo'
import type { SpotCard } from '@/lib/spots'

type SpotWithDistance = SpotCard & { distanceKm: number }

type SpotsMapProps = {
  apiKey: string
  center: LatLng
  spots: SpotWithDistance[]
  selectedId: string | null
  onSelectSpot: (id: string) => void
}

function MapPanToSelection({
  spots,
  selectedId,
}: {
  spots: SpotWithDistance[]
  selectedId: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || !selectedId) return
    const spot = spots.find((s) => s.id === selectedId)
    if (spot) {
      map.panTo({ lat: spot.latitude, lng: spot.longitude })
    }
  }, [map, selectedId, spots])

  return null
}

export function SpotsMap({
  apiKey,
  center,
  spots,
  selectedId,
  onSelectSpot,
}: SpotsMapProps) {
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="h-full w-full"
        mapId={undefined}
      >
        <MapPanToSelection spots={spots} selectedId={selectedId} />
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={{ lat: spot.latitude, lng: spot.longitude }}
            title={spot.name}
            onClick={() => onSelectSpot(spot.id)}
          />
        ))}
      </Map>
    </APIProvider>
  )
}

export function SpotsMapPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#efe5d7] px-6 text-center">
      <span className="mb-2 text-4xl">🗺️</span>
      <p className="text-sm text-gray-700">{message}</p>
    </div>
  )
}
