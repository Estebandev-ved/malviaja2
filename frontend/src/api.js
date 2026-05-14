import { auth } from './firebase';

const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:8080' : 'https://malviaja2-backend.onrender.com');


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
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (user) {
    // forceRefresh=false: usa el token cacheado si es válido (< 1h)
    const token = await user.getIdToken(false);
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Timeout global de 15 segundos para evitar colgar la UI
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(`${API_URL}${path}`, { 
      ...options, 
      headers,
      signal: options.signal || controller.signal 
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * fetch público, sin token (catálogo de productos, etc.)
 */
export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${path}`, { 
      ...options, 
      signal: options.signal || controller.signal 
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

