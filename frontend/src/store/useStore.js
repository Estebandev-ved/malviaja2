import { create } from 'zustand';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { authFetch, apiFetch } from '../api';

export const ACHIEVEMENTS = [
  { id: 1, nombre: 'Primer Vuelo', descripcion: 'Completa tu primer pedido', icono: 'trophy', tipo: 'pedidos', requisito: 1, puntosRecompensa: 200 },
  { id: 2, nombre: 'Viajero Frecuente', descripcion: 'Completa 5 pedidos', icono: 'star', tipo: 'pedidos', requisito: 5, puntosRecompensa: 500 },
  { id: 3, nombre: 'Astronauta', descripcion: 'Completa 10 pedidos', icono: 'zap', tipo: 'pedidos', requisito: 10, puntosRecompensa: 1000 },
  { id: 4, nombre: 'Leyenda', descripcion: 'Completa 25 pedidos', icono: 'crown', tipo: 'pedidos', requisito: 25, puntosRecompensa: 2500 },
  { id: 5, nombre: 'Gourmet', descripcion: 'Prueba todos los productos del catálogo', icono: 'gift', tipo: 'productos', requisito: 3, puntosRecompensa: 300 },
  { id: 6, nombre: 'Racha de Fuego', descripcion: 'Mantén 7 días consecutivos sin perder tu racha', icono: 'flame', tipo: 'racha', requisito: 7, puntosRecompensa: 500 },
  { id: 7, nombre: 'Imparable', descripcion: 'Mantén 30 días consecutivos', icono: 'target', tipo: 'racha', requisito: 30, puntosRecompensa: 2000 },
  { id: 8, nombre: 'Coleccionista', descripcion: 'Canjea 3 recompensas', icono: 'award', tipo: 'canjes', requisito: 3, puntosRecompensa: 400 },
  { id: 9, nombre: 'Influencer', descripcion: 'Consigue 3 referidos exitosos', icono: 'sparkles', tipo: 'referidos', requisito: 3, puntosRecompensa: 600 },
  { id: 10, nombre: 'VIP', descripcion: 'Alcanza 8,000 puntos de vuelo acumulados', icono: 'shopping', tipo: 'puntos', requisito: 8000, puntosRecompensa: 1500 },
  { id: 11, nombre: 'Ahorrador', descripcion: 'Acumula 2,000 Puntos de Vuelo', icono: 'wallet', tipo: 'puntos', requisito: 2000, puntosRecompensa: 300 },
  { id: 12, nombre: 'Inversionista', descripcion: 'Acumula 5,000 Puntos de Vuelo', icono: 'trending-up', tipo: 'puntos', requisito: 5000, puntosRecompensa: 800 },
];

/**
 * BUG FIX #8: El listener onAuthStateChanged se registraba dentro de create(),
 * lo que causaba múltiples registros y memory leaks al recargar el módulo (HMR).
 * 
 * Solución: se inicializa UNA SOLA VEZ con un flag de módulo (no en el closure de create).
 * El unsubscribe se guarda para poder limpiar si fuera necesario.
 */
let authListenerInitialized = false;

const useStore = create((set, get) => {
  // Registrar el listener SOLO LA PRIMERA VEZ que el store se crea
  if (!authListenerInitialized) {
    authListenerInitialized = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          rol: 'USER'
        };

        // PASO 1: Dejar pasar al usuario INMEDIATAMENTE con datos de Firebase
        set({ user: userData, authLoading: false });

        // PASO 2: Enriquecer con datos del backend EN SEGUNDO PLANO
        // Esperamos que el token esté listo para evitar race conditions con el rol
        try {
          const res = await authFetch(`/api/pedidos/usuario/${firebaseUser.uid}/perfil`);
          if (res.ok) {
            const profileData = await res.json();
            console.log('✅ Perfil cargado del backend. Rol:', profileData.rol);
            set({ user: { ...userData, ...profileData } });
          }
        } catch (e) {
          if (e.name !== 'AbortError') console.warn('Backend no disponible para perfil:', e.message);
        }
      } else {
        set({ user: null, authLoading: false });
      }
    });

    // Exponer unsubscribe en el store por si se necesita cleanup manual
    // (útil en tests o SSR)
    if (typeof window !== 'undefined') {
      window.__malviaja2AuthUnsub = unsubscribe;
    }
  }

  return {
    user: null,
    authLoading: true,

    logout: async () => {
      await signOut(auth);
      set({ user: null });
    },

    // Estado y acciones del Carrito
  carrito: [],
  isCartOpen: false,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addToCart: (producto) => set((state) => {
    const existingItem = state.carrito.find(item => item.id === producto.id);
    
    // Lógica 2x1 Automática al agregar
    const pConfig = state.promoConfig;
    const isPromoEnabled = pConfig?.promo2x1Enabled;
    const isPromoCurrentlyActive = (() => {
      if (!isPromoEnabled) return false;
      if (pConfig?.promoMode === 'MANUAL') return true;
      try {
        const now = new Date();
        const [h, m] = (pConfig?.promoStartTime || '22:00').split(':').map(Number);
        const start = new Date(); start.setHours(h, m, 0, 0);
        const end = new Date(start); end.setHours(start.getHours() + (pConfig?.promoDuration || 4));
        return now >= start && now <= end;
      } catch (e) { return false; }
    })();

    let isUserEligibleForPromo = true;
    if (pConfig?.promoTarget === 'NUEVOS') {
      isUserEligibleForPromo = state.user ? state.user.primerCompraRealizada === false : true;
    }

    const isEligibleProduct = (() => {
      const list = (pConfig?.promoProducts || 'Brownie Fuerte').split(',').map(p => p.trim().toLowerCase());
      if (list.includes('all')) return true;
      return list.some(p => producto.nombre.toLowerCase().includes(p));
    })();

    let qtyToAdd = 1;
    if (!existingItem && isPromoCurrentlyActive && isUserEligibleForPromo && pConfig?.promoTipo === '2X1' && isEligibleProduct) {
      qtyToAdd = 2; // Añade 2 automáticamente si cumple y no lo tenía en el carrito
    }

    if (existingItem) {
      return {
        carrito: state.carrito.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      };
    }
    return { carrito: [...state.carrito, { ...producto, cantidad: qtyToAdd }] };
  }),

  removeFromCart: (productoId) => set((state) => ({
    carrito: state.carrito.filter(item => item.id !== productoId)
  })),

  updateCartQuantity: (productoId, cantidad) => set((state) => ({
    carrito: cantidad <= 0
      ? state.carrito.filter(item => item.id !== productoId)
      : state.carrito.map(item =>
          item.id === productoId ? { ...item, cantidad } : item
        )
  })),

  clearCart: () => set({ carrito: [] }),

  // Gamificación (Puntos y Cupones)
  puntosTotales: 1500,
  cuponesActivos: [],

  // Logros y Rachas
  logrosObtenidos: [],
  rachaDias: 0,
  rachaMaxima: 0,
  ultimoPedidoFecha: null,
  totalPedidos: 0,
  totalCanjes: 0,

  addLogro: (logroId) => set((state) => ({
    logrosObtenidos: state.logrosObtenidos.includes(logroId) ? state.logrosObtenidos : [...state.logrosObtenidos, logroId]
  })),

  setRacha: (dias, maxima) => set({ rachaDias: dias, rachaMaxima: maxima }),
  setTotalPedidos: (n) => set({ totalPedidos: n }),
  setUltimoPedidoFecha: (f) => set({ ultimoPedidoFecha: f }),
  setTotalCanjes: (n) => set({ totalCanjes: n }),

  addPuntos: (cantidad) => set((state) => ({
    puntosTotales: state.puntosTotales + cantidad
  })),
  
  restarPuntos: (cantidad) => set((state) => ({
    puntosTotales: state.puntosTotales - cantidad
  })),

  addCupon: (cupon) => set((state) => ({
    cuponesActivos: [{ ...cupon, cupoId: Date.now() }, ...state.cuponesActivos]
  })),

  usarCupon: (cupoId) => set((state) => ({
    cuponesActivos: state.cuponesActivos.filter(c => c.cupoId !== cupoId)
  })),

  checkLogros: () => set((state) => {
    let nuevosPuntos = state.puntosTotales;
    const nuevosLogros = [...state.logrosObtenidos];
    let changed = true;
    while (changed) {
      changed = false;
      for (const a of ACHIEVEMENTS) {
        if (nuevosLogros.includes(a.id)) continue;
        let cumple = false;
        switch (a.tipo) {
          case 'puntos': cumple = nuevosPuntos >= a.requisito; break;
          case 'pedidos': cumple = state.totalPedidos >= a.requisito; break;
          case 'racha': cumple = state.rachaDias >= a.requisito; break;
          case 'canjes': cumple = state.totalCanjes >= a.requisito; break;
        }
        if (cumple) {
          nuevosLogros.push(a.id);
          nuevosPuntos += a.puntosRecompensa;
          changed = true;
        }
      }
    }
    if (nuevosLogros.length === state.logrosObtenidos.length && nuevosPuntos === state.puntosTotales) return state;
    return { logrosObtenidos: nuevosLogros, puntosTotales: nuevosPuntos };
  }),

  productos: [],
  loading: false,
  error: null,
  
  promoConfig: null,
  fetchPromoConfig: async () => {
    try {
      // Timeout de 10s para evitar que el UI se quede colgado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await apiFetch('/api/configuracion/publica', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        set({ promoConfig: data });
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('No se pudo cargar promoConfig en store:', e.message);
    }
  },
  
  fetchProductos: async () => {
    set({ loading: true, error: null });
    try {
      // Timeout de 10s para evitar que el catálogo se quede en skeleton loader
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await apiFetch('/api/productos', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      set({ productos: data, loading: false });
    } catch (error) {
      if (error.name !== 'AbortError') console.warn('No se pudieron cargar productos del backend:', error.message);
      // Solo usar fallback si NO hay datos en el store y falló la llamada
      const current = get().productos;
      if (current.length === 0) {
        set({
          productos: [
            { id: 1, nombre: 'Brownie Clásico', precio: 15000, dosis: 'Media', stock: 10, descripcion: 'Chocolate belga, dosis perfecta para relajarse.' },
            { id: 2, nombre: 'Brownie Espacial', precio: 20000, dosis: 'Alta', stock: 10, descripcion: 'Doble chocolate, recomendado para usuarios experimentados.' },
            { id: 3, nombre: 'Blondie Caramelo', precio: 18000, dosis: 'Media-Alta', stock: 10, descripcion: 'Brownie de chocolate blanco con nueces y caramelo.' }
          ],
          loading: false
        });
      } else {
        set({ error: error.message, loading: false });
      }
    }
  }
  };
});

export default useStore;
