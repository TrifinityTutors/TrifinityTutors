const rawEnv = import.meta.env.VITE_API_BASE_URL;

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  if (trimmed === 'https://trifinitytutors-backend.onrender.com') {
    trimmed = 'https://trifinitytutors-backend-11nn.onrender.com';
  }
  return trimmed;
}

export const API_BASE = normalizeUrl(rawEnv) || (
  import.meta.env.DEV ? 'http://localhost:5001' : 'https://trifinitytutors-backend-11nn.onrender.com'
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

