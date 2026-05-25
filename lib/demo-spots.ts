import type { LatLng } from '@/lib/geo'
import type { SpotCard } from '@/lib/spots'

/** Sample spot for UI demo — ~0.7 km offset from user center, always within 5 km */
export function demoSpotNear(center: LatLng): SpotCard {
  return {
    id: 'demo-idli-corner',
    name: 'Idli Corner',
    latitude: center.lat + 0.0065,
    longitude: center.lng + 0.0038,
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Idli+Corner+Bengaluru',
    channel: 'Bong Eats',
    thumbnailUrl: 'https://i.ytimg.com/vi/2Y5IQIC8mh8/mqdefault.jpg',
    youtubeVideoId: '2Y5IQIC8mh8',
  }
}

export function withDemoSpot(spots: SpotCard[], center: LatLng): SpotCard[] {
  if (process.env.NEXT_PUBLIC_HIDE_DEMO_SPOT === '1') return spots
  if (spots.some((s) => s.id === 'demo-idli-corner')) return spots
  return [...spots, demoSpotNear(center)]
}
