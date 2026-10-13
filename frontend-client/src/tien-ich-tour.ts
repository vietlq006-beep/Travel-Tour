import type { Tour } from './types/du-lieu'

export type TourCollection = 'wishlist' | 'recent' | 'compare'
const keyOf = (collection: TourCollection) => `leviet_${collection}_tours`

export function readTours(collection: TourCollection): Tour[] {
  try { return JSON.parse(localStorage.getItem(keyOf(collection)) || '[]') as Tour[] } catch { return [] }
}

function writeTours(collection: TourCollection, tours: Tour[]) {
  localStorage.setItem(keyOf(collection), JSON.stringify(tours))
  window.dispatchEvent(new CustomEvent('leviet:tours-saved'))
}

export function hasTour(collection: TourCollection, id: Tour['id']) {
  return readTours(collection).some((tour) => String(tour.id) === String(id))
}

export function toggleTour(collection: 'wishlist' | 'compare', tour: Tour) {
  const items = readTours(collection)
  const exists = items.some((item) => String(item.id) === String(tour.id))
  if (exists) writeTours(collection, items.filter((item) => String(item.id) !== String(tour.id)))
  else writeTours(collection, [tour, ...items].slice(0, collection === 'compare' ? 3 : 30))
  return !exists
}

export function rememberTour(tour: Tour) {
  writeTours('recent', [tour, ...readTours('recent').filter((item) => String(item.id) !== String(tour.id))].slice(0, 12))
}

export function clearTours(collection: TourCollection) { writeTours(collection, []) }
