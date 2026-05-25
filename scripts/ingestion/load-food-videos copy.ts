//given a youtube channel 📺 id pull all the playlist items and push to supabase✅
//channel and playlists tables respectively

import { config } from 'dotenv'
config({ path: '.env.local' })

import { supabase } from '@/lib/supabase'
import { google, youtube_v3 } from 'googleapis'
import { getDescriptionParser } from './parse-youtube-desc'

//what about those playlist which was not considered🤔
/// save -> save where ? -> recheck why it was not considered
/// if reconsidered --> plan to run only that manually

//what about those videos where address was not found❕
/// save -> save where ? -> recheck why it was not considered
/// if reconsidered --> plan to run only that manually

// later :

//load will be done every 2 months✌️
//repeat steps 1
//tweak step 2 => Add new playlist ( if any ) and add to the set
//tweak step 3 => now only pull new videos( if any ) and add to the set

const youtubeChannelId = process.argv[2]
if (!youtubeChannelId) {
  console.error('Usage: npx tsx "scripts/ingestion/load-food-videos copy.ts" <youtube_channel_id>')
  process.exit(1)
}

if (!process.env.YOUTUBE_API_KEY) {
  console.error('Missing YOUTUBE_API_KEY in .env.local')
  process.exit(1)
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

async function run() {
  const channelRow = await syncChannel(youtubeChannelId)
  const playlists = await fetchAllPlaylists(youtubeChannelId)
  await syncPlaylists(channelRow.id, playlists)
  console.log(`Synced channel "${channelRow.name}" with ${playlists.length} playlist(s)`)

  const parser = getDescriptionParser(channelRow.name)
  if (!parser) {
    console.warn(`No description parser for channel "${channelRow.name}" — videos will sync without spots`)
  }

  const playlistRows = await loadPlaylistRows(channelRow.id)
  const videoIds = await collectVideoIds(playlistRows.map((p) => p.youtube_playlist_id))
  console.log(`Found ${videoIds.length} unique video(s) across playlists`)

  const youtubeVideos = await fetchVideoDetails(videoIds)
  let syncedVideos = 0
  let syncedSpots = 0
  let skippedSpots = 0

  for (const video of youtubeVideos) {
    const videoId = video.id
    const snippet = video.snippet
    if (!videoId || !snippet?.title) continue

    const videoRow = await syncVideo(channelRow.id, video)
    syncedVideos++

    if (!parser || !snippet.description) {
      skippedSpots++
      continue
    }

    const parsed = await parser({
      title: snippet.title,
      description: snippet.description,
    })

    if (!parsed) {
      console.warn(`No spot parsed for video ${videoId}: ${snippet.title}`)
      skippedSpots++
      continue
    }

    await syncSpot(videoRow.id, parsed)
    syncedSpots++
  }

  console.log(`Done — ${syncedVideos} video(s), ${syncedSpots} spot(s), ${skippedSpots} without spot`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

async function syncChannel(youtubeId: string) {
  const res = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    id: [youtubeId],
  })

  const channel = res.data.items?.[0]
  if (!channel?.snippet?.title) {
    throw new Error(`YouTube channel not found: ${youtubeId}`)
  }

  const subscribers = channel.statistics?.subscriberCount
    ? Number(channel.statistics.subscriberCount)
    : null

  const { data, error } = await supabase
    .from('channels')
    .upsert(
      {
        youtube_channel_id: youtubeId,
        name: channel.snippet.title,
        subscribers,
      },
      { onConflict: 'youtube_channel_id' },
    )
    .select('id, name')
    .single()

  if (error) throw error
  return data
}

async function fetchAllPlaylists(channelId: string): Promise<youtube_v3.Schema$Playlist[]> {
  const playlists: youtube_v3.Schema$Playlist[] = []
  let pageToken: string | undefined

  do {
    const res = await youtube.playlists.list({
      part: ['snippet'],
      channelId,
      maxResults: 50,
      pageToken,
    })
    if (res.data.items) playlists.push(...res.data.items)
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken)

  return playlists
}

async function syncPlaylists(
  channelId: string,
  playlists: youtube_v3.Schema$Playlist[],
) {
  if (playlists.length === 0) return

  const rows = playlists
    .filter((p) => p.id && p.snippet?.title)
    .map((p) => ({
      channel_id: channelId,
      youtube_playlist_id: p.id!,
      name: p.snippet!.title!,
      description: p.snippet!.description ?? null,
    }))

  const { error } = await supabase
    .from('playlists')
    .upsert(rows, { onConflict: 'youtube_playlist_id' })

  if (error) throw error
}

async function loadPlaylistRows(channelId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select('youtube_playlist_id')
    .eq('channel_id', channelId)

  if (error) throw error
  return data ?? []
}

async function collectVideoIds(playlistIds: string[]): Promise<string[]> {
  const ids = new Set<string>()

  for (const playlistId of playlistIds) {
    let pageToken: string | undefined
    do {
      const res = await youtube.playlistItems.list({
        part: ['contentDetails'],
        playlistId,
        maxResults: 50,
        pageToken,
      })
      for (const item of res.data.items ?? []) {
        const videoId = item.contentDetails?.videoId
        if (videoId) ids.add(videoId)
      }
      pageToken = res.data.nextPageToken ?? undefined
    } while (pageToken)
  }

  return [...ids]
}

async function fetchVideoDetails(
  videoIds: string[],
): Promise<youtube_v3.Schema$Video[]> {
  const videos: youtube_v3.Schema$Video[] = []

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const res = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: batch,
    })
    if (res.data.items) videos.push(...res.data.items)
  }

  return videos
}

async function syncVideo(
  channelId: string,
  video: youtube_v3.Schema$Video,
) {
  const snippet = video.snippet!
  const stats = video.statistics

  const { data, error } = await supabase
    .from('videos')
    .upsert(
      {
        youtube_video_id: video.id!,
        title: snippet.title!,
        description: snippet.description ?? null,
        thumbnail_url:
          snippet.thumbnails?.high?.url ??
          snippet.thumbnails?.medium?.url ??
          snippet.thumbnails?.default?.url ??
          null,
        published_at: snippet.publishedAt ?? null,
        channel_id: channelId,
        views: stats?.viewCount ? Number(stats.viewCount) : null,
        likes: stats?.likeCount ? Number(stats.likeCount) : null,
      },
      { onConflict: 'youtube_video_id' },
    )
    .select('id')
    .single()

  if (error) throw error
  return data
}

async function syncSpot(
  videoId: string,
  spot: {
    name: string
    latitude: number
    longitude: number
    maps_url: string
    city?: string | null
    address?: string | null
  },
) {
  const { data: existing } = await supabase
    .from('spots')
    .select('id')
    .eq('video_id', videoId)
    .maybeSingle()

  const row = {
    name: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    maps_url: spot.maps_url,
    city: spot.city ?? null,
    address: spot.address ?? null,
    video_id: videoId,
  }

  if (existing) {
    const { error } = await supabase.from('spots').update(row).eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('spots').insert(row)
  if (error) throw error
}
