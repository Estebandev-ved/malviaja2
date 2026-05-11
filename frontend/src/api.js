import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Espera a que Firebase Auth termine de inicializar (restaurar sesión desde
 * IndexedDB/localStorage) antes de leer currentUser.
 * Esto previene la race condition que causaba 403 al cargar la página.
 */
async function getAuthenticatedUser() {
  // authStateReady() resuelve una sola vez cuando el estado inicial se conoce.
  await auth.authStateReady();
  return auth.currentUser;
}

/**
 * fetch con Bearer token de Firebase auto-inyectado.
 * Úsalo en lugar de fetch() para cualquier llamada al backend.
 * Seguridad: valida que el token sea fresco (getIdToken fuerza refresh si expira).
 */
export async function authFetch(path, options = {}) {
  const user = await getAuthenticatedUser();
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (user) {
    // forceRefresh=false: usa el token cacheado si es válido (< 1h)
    const token = await user.getIdToken(false);
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
