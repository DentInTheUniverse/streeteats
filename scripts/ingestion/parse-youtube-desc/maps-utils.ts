export function extractGoogleMapsUrl(description: string): string | null {
  const match = description.match(/Google Maps:\s*(https?:\/\/\S+)/i)
  return match?.[1] ?? null
}

export async function expandMapsShortUrl(shortUrl: string): Promise<string> {
  const res = await fetch(shortUrl, { redirect: 'follow' })
  return res.url
}

/** Prefer place-pin coords (!3d/!4d) over map viewport center (@lat,lng). */
export function extractLatLngFromMapsUrl(url: string): { lat: number; lng: number } {
  const pin = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (pin) return { lat: Number(pin[1]), lng: Number(pin[2]) }

  const center = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (center) return { lat: Number(center[1]), lng: Number(center[2]) }

  throw new Error(`Could not parse lat/lng from Maps URL: ${url}`)
}

export function extractPlaceNameFromMapsUrl(url: string): string | undefined {
  const match = url.match(/\/place\/([^/@]+)/)
  if (!match) return undefined
  return decodeURIComponent(match[1].replace(/\+/g, ' '))
}

export async function resolveMapsLink(shortUrl: string) {
  const maps_url = await expandMapsShortUrl(shortUrl)
  const { lat, lng } = extractLatLngFromMapsUrl(maps_url)
  const placeName = extractPlaceNameFromMapsUrl(maps_url)
  return { maps_url, latitude: lat, longitude: lng, placeName }
}

export function spotNameFromTitle(title: string, fallback?: string): string {
  const trimmed = title.split(/[|–—-]/)[0]?.trim()
  return trimmed || fallback || title.trim()
}
