const rawEnv = import.meta.env.VITE_API_BASE_URL;

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const API_BASE = normalizeUrl(rawEnv) || (
  import.meta.env.DEV ? 'http://localhost:5001' : 'https://trifinitytutors-backend.onrender.com'
);

export function apiUrl(path) {
  if (!path) return API_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  const sep = path.startsWith('/') ? '' : '/';
  return `${API_BASE}${sep}${path}`;
}

export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  return fetch(url, options);
}

