export type ParsedSpot = {
  name: string
  latitude: number
  longitude: number
  maps_url: string
  city?: string | null
  address?: string | null
}

export type ParseDescriptionInput = {
  title: string
  description: string
}
