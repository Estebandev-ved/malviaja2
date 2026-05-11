import { create } from 'zustand';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { authFetch, apiFetch } from '../api';

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
          console.warn('Backend no disponible para perfil:', e.message);
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
    if (existingItem) {
      return {
        carrito: state.carrito.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      };
    }
    return { carrito: [...state.carrito, { ...producto, cantidad: 1 }] };
  }),

  removeFromCart: (productoId) => set((state) => ({
    carrito: state.carrito.filter(item => item.id !== productoId)
  })),

  clearCart: () => set({ carrito: [] }),

  // Gamificación (Puntos y Cupones)
  puntosTotales: 1500, // Empieza con bono de bienvenida
  cuponesActivos: [],

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

  // Productos del catálogo iniciales para carga ultra-rápida (Optimistic UI)
  productos: [
    { id: 1, nombre: 'Brownie Clásico', precio: 15000, dosis: 'Media', descripcion: 'Chocolate belga, dosis perfecta para relajarse.' },
    { id: 2, nombre: 'Brownie Espacial', precio: 20000, dosis: 'Alta', descripcion: 'Doble chocolate, recomendado para usuarios experimentados.' },
    { id: 3, nombre: 'Blondie Caramelo', precio: 18000, dosis: 'Media-Alta', descripcion: 'Brownie de chocolate blanco con nueces y caramelo.' }
  ],
  loading: false,
  error: null,
  
  fetchProductos: async () => {
    // Si no hay productos, mostramos loading. Si ya hay, actualizamos en 2do plano sin bloquear UI
    if (get().productos.length === 0) {
      set({ loading: true, error: null });
    } else {
      set({ error: null }); // background refresh
    }
    try {
      const response = await apiFetch('/api/productos');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      set({ productos: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      
      console.warn('Usando datos de prueba por fallo en el backend:', error.message);
      set({
        productos: [
          { id: 1, nombre: 'Brownie Clásico', precio: 15000, dosis: 'Media', descripcion: 'Chocolate belga, dosis perfecta para relajarse.' },
          { id: 2, nombre: 'Brownie Espacial', precio: 20000, dosis: 'Alta', descripcion: 'Doble chocolate, recomendado para usuarios experimentados.' },
          { id: 3, nombre: 'Blondie Caramelo', precio: 18000, dosis: 'Media-Alta', descripcion: 'Brownie de chocolate blanco con nueces y caramelo.' }
        ],
        loading: false
      });
    }
  }
  };
});

export default useStore;
