/** Default "near me" radius — override via NEXT_PUBLIC_DEFAULT_RADIUS_KM */
export const DEFAULT_RADIUS_KM = Number(
  process.env.NEXT_PUBLIC_DEFAULT_RADIUS_KM ?? 5,
)

/** Bangalore — used when geolocation is denied or unavailable */
export const FALLBACK_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
} as const
