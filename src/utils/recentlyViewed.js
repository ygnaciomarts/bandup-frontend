const STORAGE_KEY = 'bandup_recently_viewed'
const MAX_ITEMS = 20

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function addToRecentlyViewed(productId) {
  const id = Number(productId)
  if (!id) return
  const items = getRecentlyViewed().filter(i => i !== id)
  items.unshift(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function getRecentlyViewedIds() {
  return getRecentlyViewed().join(',')
}
