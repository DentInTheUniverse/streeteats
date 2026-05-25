export type SpotCard = {
  id: string
  name: string
  latitude: number
  longitude: number
  mapsUrl: string | null
  channel: string
  thumbnailUrl: string | null
  youtubeVideoId: string | null
}

type VideoEmbed = {
  thumbnail_url: string | null
  youtube_video_id: string | null
  channels: { name: string } | { name: string }[] | null
} | null

type SpotRow = {
  id: string
  name: string
  latitude: number
  longitude: number
  maps_url: string | null
  videos: VideoEmbed | VideoEmbed[]
}

export function normalizeSpots(rows: SpotRow[]): SpotCard[] {
  return rows.map((spot) => {
    const videos = spot.videos
    const video = Array.isArray(videos) ? videos[0] : videos
    const channels = video?.channels
    const channel = Array.isArray(channels) ? channels[0] : channels

    return {
      id: spot.id,
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
      mapsUrl: spot.maps_url,
      channel: channel?.name ?? 'Unknown channel',
      thumbnailUrl: video?.thumbnail_url ?? null,
      youtubeVideoId: video?.youtube_video_id ?? null,
    }
  })
}

export function mapsLinkForSpot(spot: SpotCard): string {
  if (spot.mapsUrl) return spot.mapsUrl
  return `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
}

export function youtubeLinkForSpot(spot: SpotCard): string | null {
  if (!spot.youtubeVideoId) return null
  return `https://www.youtube.com/watch?v=${spot.youtubeVideoId}`
}
