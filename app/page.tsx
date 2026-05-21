import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data : spots, error } = await supabase
  .from('spots')
  .select(`
    id,
    name,
    videos (
      thumbnail_url,
      channels (
        name
      )
    )
  `)

  if (error) {
    console.error(error)
    return <div>Error: {error.message}</div>
  }

  if (!spots) {
    return <div>No spots found</div>
  }

  console.log("spots-->",spots)

  const spotsData = spots.map((spot) => {
    const videos = spot.videos
    const video = Array.isArray(videos) ? videos[0] : videos
  
    const channels = video?.channels
    const channel = Array.isArray(channels) ? channels[0] : channels
  
    return {
      id: spot.id,
      name: spot.name,
      image: video?.thumbnail_url ?? '',
      channel: channel?.name ?? '',
    }
  })
  
  console.log("spotsData-->",spotsData)

  if (!spotsData) {
    return <div>No spots data found</div>
  }

    return (
      <main className="min-h-screen bg-[#f7f3ee] flex justify-center py-6 px-4">
        <div className="w-full max-w-md">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-white p-2 rounded-xl text-xl">
                🍢
              </div>
  
              <h1 className="text-3xl font-bold text-black">
                StreetEats
              </h1>
            </div>
  
            <div className="flex items-center gap-3">
              <button className="text-2xl">
                🔍
              </button>
  
              <button className="bg-orange-100 px-4 py-2 rounded-full font-medium">
                BLR
              </button>
            </div>
          </div>
  
          {/* MAP SECTION */}
          <div className="relative h-[420px] rounded-[32px] overflow-hidden bg-[#efe5d7] mb-6">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
              alt="map"
              className="w-full h-full object-cover opacity-20"
            />
  
            {/* MARKERS */}
            <div className="absolute top-16 left-16 text-5xl">
              📍
            </div>
  
            <div className="absolute top-32 right-20 text-5xl">
              📍
            </div>
  
            <div className="absolute bottom-24 left-24 text-5xl">
              📍
            </div>
          </div>
  
          {/* FOOD LIST */}
          <section>
            <h2 className="text-4xl font-bold mb-6">
             That Famous Street food ! 🤤
            </h2>
  
            <div className="space-y-4">
              {spotsData.map((spot) => (
                <div
                  key={spot.id}
                  className="bg-white rounded-3xl p-4 shadow-sm flex gap-4"
                >
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
  
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {spot.name}
                      </h3>
  
                      <p className="text-gray-500 mt-1">
                        {spot.channel}
                      </p>
                    </div>
  
                    <div className="flex gap-6 mt-4">
                      <button className="flex items-center gap-2 font-medium text-lg">
                        ▶ Watch
                      </button>
  
                      <button className="flex items-center gap-2 font-medium text-lg">
                        🌍 Maps
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
}