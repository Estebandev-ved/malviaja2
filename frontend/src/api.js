import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * fetch con Bearer token de Firebase auto-inyectado.
 * Úsalo en lugar de fetch() para cualquier llamada al backend.
 */
export async function authFetch(path, options = {}) {
  const user = auth.currentUser;
  const headers = { ...options.headers };

  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, { ...options, headers });
}

/**
 * fetch público, sin token (catálogo de productos, etc.)
 */
export function apiFetch(path, options = {}) {
  return fetch(`${API_URL}${path}`, options);
}
