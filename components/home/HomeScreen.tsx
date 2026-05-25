'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_RADIUS_KM, FALLBACK_CENTER } from '@/lib/constants'
import { filterAndSortByDistance, type LatLng } from '@/lib/geo'
import type { SpotCard } from '@/lib/spots'
import { SpotsDrawer } from './SpotsDrawer'
import { SpotsMap, SpotsMapPlaceholder } from './SpotsMap'
import { StreetEatsHeader } from './StreetEatsHeader'

type HomeScreenProps = {
  spots: SpotCard[]
  mapsApiKey: string | undefined
}

export function HomeScreen({ spots, mapsApiKey }: HomeScreenProps) {
  const [userCenter, setUserCenter] = useState<LatLng | null>(null)
  const [locating, setLocating] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerExpanded, setDrawerExpanded] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported')
      setUserCenter(FALLBACK_CENTER)
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLocating(false)
      },
      () => {
        setGeoError('Location denied — showing Bangalore')
        setUserCenter(FALLBACK_CENTER)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const nearbySpots = useMemo(() => {
    if (!userCenter) return []
    return filterAndSortByDistance(spots, userCenter, DEFAULT_RADIUS_KM)
  }, [spots, userCenter])

  useEffect(() => {
    if (nearbySpots.length > 0 && !selectedId) {
      setSelectedId(nearbySpots[0].id)
    }
  }, [nearbySpots, selectedId])

  const handleSelectSpot = useCallback((id: string) => {
    setSelectedId(id)
    setDrawerExpanded(true)
  }, [])

  const center = userCenter ?? FALLBACK_CENTER

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-[#f7f3ee]">
      <StreetEatsHeader
        radiusKm={DEFAULT_RADIUS_KM}
        spotCount={nearbySpots.length}
        locating={locating}
      />

      <div className="relative min-h-0 flex-1">
        <div className="h-[58vh] w-full shrink-0 overflow-hidden">
          {mapsApiKey && !locating ? (
            <SpotsMap
              apiKey={mapsApiKey}
              center={center}
              spots={nearbySpots}
              selectedId={selectedId}
              onSelectSpot={handleSelectSpot}
            />
          ) : (
            <SpotsMapPlaceholder
              message={
                locating
                  ? 'Finding your location…'
                  : 'Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to load Google Maps.'
              }
            />
          )}
        </div>

        {!locating ? (
          <SpotsDrawer
            spots={nearbySpots}
            selectedId={selectedId}
            expanded={drawerExpanded}
            onToggleExpand={() => setDrawerExpanded((v) => !v)}
            onSelectSpot={handleSelectSpot}
          />
        ) : null}
      </div>

      {geoError ? (
        <p className="px-4 pb-2 text-center text-xs text-amber-800">{geoError}</p>
      ) : null}
    </div>
  )
}
