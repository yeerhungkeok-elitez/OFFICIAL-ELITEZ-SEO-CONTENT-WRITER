const KEY = 'seo_growth_engine_v1'

export function loadStorage() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { projects: [], activeProjectId: null }
  } catch {
    return { projects: [], activeProjectId: null }
  }
}

export function saveStorage(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (e) {
    console.error('localStorage write failed:', e)
  }
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}
