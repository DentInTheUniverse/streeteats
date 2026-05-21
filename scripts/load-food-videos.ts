import { config } from 'dotenv'
config({ path: '.env.local' })
import { supabase } from '@/lib/supabase'
import { google } from 'googleapis'

async function run() {

  //call youtube api to get videos for each spot
  const videos = await getVideosForSpot()
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
    console.log(response.data)
    return response.data.items
}

