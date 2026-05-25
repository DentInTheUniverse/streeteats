import { HomeScreen } from '@/components/home/HomeScreen'
import { supabase } from '@/lib/supabase'
import { normalizeSpots } from '@/lib/spots'

export default async function Home() {
  const { data, error } = await supabase.from('spots').select(`
    id,
    name,
    latitude,
    longitude,
    maps_url,
    videos (
      thumbnail_url,
      youtube_video_id,
      channels (
        name
      )
    )
  `)

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-red-600">
        Failed to load spots: {error.message}
      </div>
    )
  }

  const spots = normalizeSpots(data ?? [])
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return <HomeScreen spots={spots} mapsApiKey={mapsApiKey} />
}
