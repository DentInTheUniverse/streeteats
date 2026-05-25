import { config } from 'dotenv'
config({ path: '.env.local' })
import { supabase } from '@/lib/supabase'
import { google } from 'googleapis'

async function run() {

  //call youtube api to get videos for each spot
  const videos = await getVideosForSpot()
  
  const shortUrl = 'https://maps.app.goo.gl/eBQuLaQQB71xLRa3A'
  const fullUrl = await expandMapsShortUrl(shortUrl)
  const { lat, lng } = extractLatLngFromMapsUrl(fullUrl)
  console.log({ fullUrl, lat, lng })
}

run()


async function getVideosForSpot() {
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
    })
    const response = await youtube.playlistItems.list({
        "part": [
        "snippet"
      ],
      "maxResults": 50,
      "playlistId": "PLri_37vf6mmoBqRLTTk6U-wZVZukqjyt-"
    })
    console.log(response.data.items?.[0].snippet?.description?.match(/Google Maps:\s*(https?:\/\/\S+)/i)?.[1])
    return response.data.items
}

async function expandMapsShortUrl(shortUrl: string): Promise<string> {
  const res = await fetch(shortUrl, { redirect: 'follow' })
  return res.url // final URL after all redirects
}

/** Prefer place-pin coords (!3d/!4d) over map viewport center (@lat,lng). */
function extractLatLngFromMapsUrl(url: string): { lat: number; lng: number } {
  const pin = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (pin) return { lat: Number(pin[1]), lng: Number(pin[2]) }

  const center = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (center) return { lat: Number(center[1]), lng: Number(center[2]) }

  throw new Error(`Could not parse lat/lng from Maps URL: ${url}`)
}



