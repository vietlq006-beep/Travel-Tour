import type { QueryParams } from '../types/du-lieu'

export function compactParams(params: QueryParams = {}): QueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}
