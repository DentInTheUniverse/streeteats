import type { ParseDescriptionInput, ParsedSpot } from './types'
import { parseFoodLoversTv } from './parse-food-lovers-tv'
import { parseIndianFoodExplorers } from './parse-indian-food-explorers'
import { parseIndiaEatMania } from './parse-india-eat-mania'

type DescriptionParser = (input: ParseDescriptionInput) => Promise<ParsedSpot | null>

const parsers: { match: (name: string) => boolean; parse: DescriptionParser }[] = [
  { match: (n) => n.includes('food lovers tv'), parse: parseFoodLoversTv },
  { match: (n) => n.includes('indian food explorers'), parse: parseIndianFoodExplorers },
  { match: (n) => n.includes('india eat mania'), parse: parseIndiaEatMania },
]

export function getDescriptionParser(channelName: string): DescriptionParser | null {
  const normalized = channelName.toLowerCase()
  return parsers.find((p) => p.match(normalized))?.parse ?? null
}
