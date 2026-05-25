import type { ParseDescriptionInput, ParsedSpot } from './types'
import {
  extractGoogleMapsUrl,
  resolveMapsLink,
  spotNameFromTitle,
} from './maps-utils'

export async function parseIndianFoodExplorers(
  input: ParseDescriptionInput,
): Promise<ParsedSpot | null> {
  const shortUrl = extractGoogleMapsUrl(input.description)
  if (!shortUrl) return null

  const { maps_url, latitude, longitude, placeName } = await resolveMapsLink(shortUrl)
  return {
    name: spotNameFromTitle(input.title, placeName),
    latitude,
    longitude,
    maps_url,
    city: null,
    address: null,
  }
}
