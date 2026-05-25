type StreetEatsHeaderProps = {
  radiusKm: number
  spotCount: number
  locating: boolean
}

export function StreetEatsHeader({
  radiusKm,
  spotCount,
  locating,
}: StreetEatsHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-orange-500 p-2 text-xl text-white">🍢</div>
        <h1 className="text-2xl font-bold text-black">StreetEats</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xl text-gray-600"
          aria-label="Search (coming soon)"
          disabled
          title="Search — coming in V2"
        >
          🔍
        </button>
        <span className="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-900">
          {locating ? '…' : `${radiusKm} km`}
        </span>
        <span className="rounded-full bg-white/90 px-2 py-1 text-xs text-gray-600 shadow-sm">
          {spotCount} spots
        </span>
      </div>
    </header>
  )
}
