export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5001' : 'https://trifinitytutors-backend.onrender.com')

export function apiUrl(path) {
  if (!path) return API_BASE
  if (path.startsWith('http')) return path
  const sep = path.startsWith('/') ? '' : '/'
  return `${API_BASE}${sep}${path}`
}

export async function apiFetch(path, options = {}) {
  const url = apiUrl(path)
  return fetch(url, options)
}
