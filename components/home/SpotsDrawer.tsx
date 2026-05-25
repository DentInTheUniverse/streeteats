'use client'

import { formatDistance } from '@/lib/geo'
import {
  mapsLinkForSpot,
  type SpotCard,
  youtubeLinkForSpot,
} from '@/lib/spots'

type SpotWithDistance = SpotCard & { distanceKm: number }

type SpotsDrawerProps = {
  spots: SpotWithDistance[]
  selectedId: string | null
  expanded: boolean
  onToggleExpand: () => void
  onSelectSpot: (id: string) => void
}

export function SpotsDrawer({
  spots,
  selectedId,
  expanded,
  onToggleExpand,
  onSelectSpot,
}: SpotsDrawerProps) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-[28px] bg-[#f7f3ee] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-[height] duration-300 ease-out ${
        expanded ? 'h-[58vh]' : 'h-[44vh] min-h-[320px]'
      }`}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full flex-col items-center py-2"
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse spot list' : 'Expand spot list'}
      >
        <span className="mb-1 h-1 w-10 rounded-full bg-gray-300" />
        <span className="text-xs font-medium text-gray-500">
          {expanded ? '⬇️ Swipe down' : '⬆️ Nearby street food'}
        </span>
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {spots.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-600">
            No spots within range. Try increasing the radius or run ingestion for
            your area.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {spots.map((spot) => {
              const selected = spot.id === selectedId
              const mapsUrl = mapsLinkForSpot(spot)
              const youtubeUrl = youtubeLinkForSpot(spot)

              return (
                <li key={spot.id}>
                  <article
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectSpot(spot.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectSpot(spot.id)
                      }
                    }}
                    className={`rounded-2xl border bg-white p-3 shadow-sm transition-colors ${
                      selected
                        ? 'border-orange-400 ring-2 ring-orange-200'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-black">
                          🍴 {spot.name}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          ▶ {spot.channel}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistance(spot.distanceKm)} away
                        </p>
                      </div>
                      {spot.thumbnailUrl ? (
                        <img
                          src={spot.thumbnailUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3">
                      {youtubeUrl ? (
                        <a
                          href={youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium text-orange-600"
                        >
                          ▶ Watch
                        </a>
                      ) : null}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-orange-600"
                      >
                        🌐 Open in Maps
                      </a>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
