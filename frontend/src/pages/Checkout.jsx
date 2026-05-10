import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Banknote, ShieldCheck } from 'lucide-react';
import { authFetch } from '../api';

const Checkout = () => {
  const { carrito, clearCart, user, cuponesActivos, usarCupon } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: user ? user.displayName : '',
    direccion: '',
    telefono: ''
  });
  const [comprobante, setComprobante] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [primerViaje, setPrimerViaje] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Autocompletar datos si el usuario ya ha comprado antes
    const fetchPerfil = async () => {
      try {
        const res = await authFetch(`/api/pedidos/usuario/${user.uid}/perfil`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            direccion: data.direccionPorDefecto || '',
            telefono: data.telefonoPorDefecto || ''
          }));
          setPrimerViaje(!data.primerCompraRealizada);
        }
      } catch (e) {
        console.error("Error obteniendo perfil", e);
      }
    };
    fetchPerfil();
  }, [user, navigate]);

  const [distancia, setDistancia] = useState(0);
  const [isCalculando, setIsCalculando] = useState(false);

  // Cálculos Matemáticos con Cupones
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  const cuponEnvio = cuponesActivos.find(c => c.id === 'envio');
  
  // Lógica de Envío Inteligente ($1,500 por KM)
  const originMedellin = { lat: 6.2442, lon: -75.5812 };
  const valorKm = 1500;
  
  const calculateDistance = async (address) => {
    if (!address || address.length < 8) return; // Dirección más larga para precisión
    setIsCalculando(true);
    console.log("Calculando envío para:", address);
    try {
      // 1. Geocodificación
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Medellín")}`);
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) throw new Error("Dirección no encontrada");

      const dest = { lat: geoData[0].lat, lon: geoData[0].lon };

      // 2. Enrutamiento
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${originMedellin.lon},${originMedellin.lat};${dest.lon},${dest.lat}?overview=false`);
      const routeData = await routeRes.json();
      if (routeData.code !== 'Ok') throw new Error("Error en ruta");

      const distInKm = routeData.routes[0].distance / 1000;
      console.log("Distancia calculada:", distInKm);
      setDistancia(distInKm);
    } catch (err) {
      console.warn("No se pudo calcular la distancia exacta:", err.message);
      setDistancia(0);
    } finally {
      setIsCalculando(false);
    }
  };

  // Auto-calcular cuando cambie la dirección o cuando se cargue del perfil
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateDistance(formData.direccion);
    }, 1500); // 1.5s de espera después de escribir
    return () => clearTimeout(timer);
  }, [formData.direccion]);

  const costoEnvio = cuponEnvio ? 0 : (distancia > 0 ? Math.round(distancia * valorKm) : 10000);

  const cuponRegalo = cuponesActivos.find(c => c.id === 'regalo');
  const cuponBrownie = cuponesActivos.find(c => c.id === 'brownie');

  // Si tiene brownie gratis, le descontamos 15000 (valor base) del total
  const descuentoBrownie = cuponBrownie ? 15000 : 0;
  
  // Descuento del 20% para primeros viajeros
  const descuentoPrimerViaje = primerViaje ? Math.round(subtotal * 0.20) : 0;
  
  let totalCalculado = subtotal + costoEnvio - descuentoBrownie - descuentoPrimerViaje;
  if (totalCalculado < 0) totalCalculado = 0; // Evitar negativos

  const cumpleMinimo = subtotal >= 15000;

  // Redirigir a login si lograron entrar aquí sin user por alguna razón
  if (!user && !success) {
    navigate('/login');
    return null;
  }

  if (carrito.length === 0 && !success) {
    return (
      <div className="container py-16 text-center">
        <h2 className="section-title">Tu carrito está vacío</h2>
        <button className="btn btn--primary" onClick={() => navigate('/comestibles')}>Ir a comprar</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comprobante) {
      alert("Por favor, sube el comprobante de pago.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Aquí integraremos luego la subida a Firebase o al Backend
    const form = new FormData();
    form.append("userId", user.uid);
    form.append("email", user.email || ''); // BUG FIX: sin esto los nuevos usuarios quedan sin email en BD
    form.append("nombre", formData.nombre);
    form.append("direccion", formData.direccion);
    form.append("telefono", formData.telefono);
    form.append("total", totalCalculado);
    form.append("comprobante", comprobante);
    form.append("carrito", JSON.stringify(carrito));

    try {
      const response = await authFetch('/api/pedidos/checkout', {
        method: 'POST',
        body: form
      });
      
      if (response.status === 409) {
        // Error de stock controlado — mostrar al usuario qué producto no tiene stock
        const errorData = await response.json();
        alert(`⚠️ No podemos procesar tu pedido:\n\n${errorData.error}\n\nPor favor ajusta tu carrito.`);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al enviar el pedido');
      }
      
      // Consumir cupones usados
      if (cuponEnvio) usarCupon(cuponEnvio.cupoId);
      if (cuponRegalo) usarCupon(cuponRegalo.cupoId);
      if (cuponBrownie) usarCupon(cuponBrownie.cupoId);

      setSuccess(true);
      clearCart();
    } catch (error) {
      alert(`Hubo un error procesando tu pedido:\n${error.message}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container py-16 text-center">
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)' }}>
          <CheckCircle2 size={64} className="text-secondary" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="text-primary font-bold" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>¡Pedido Recibido!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Hemos recibido tu orden y el comprobante de pago de forma segura. Nuestro equipo ya está verificando la transacción para comenzar a preparar tu viaje lo antes posible.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn--secondary" onClick={() => navigate('/perfil')}>Rastrear mi pedido</button>
            <button className="btn btn--primary" onClick={() => navigate('/')}>Volver al Inicio</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <h1 className="section-title text-center">Finalizar Compra</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Resumen y Pagos */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Banknote className="text-secondary" />
            <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', margin: 0 }}>1. Resumen y Pago</h3>
          </div>
          <p style={{ marginBottom: '1rem', color: 'var(--color-text-light)' }}>
            Para garantizar tu seguridad y la nuestra, procesamos los pagos a través de transferencia directa. Por favor, transfiere el valor exacto a la siguiente cuenta y toma una captura de pantalla del comprobante exitoso.
          </p>
          <div style={{ background: '#fff8e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', border: '1px solid #fbc02d', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="font-bold text-primary-dark" style={{ fontSize: '1.2rem' }}>Nequi / Bancolombia: 300 123 4567</p>
            <p>Titular: Malviaja2 Oficial</p>
            <hr style={{ border: 'none', borderTop: '1px dashed #fbc02d', margin: '0.5rem 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
              <span>Envío:</span>
              {cuponEnvio ? (
                <span className="text-secondary font-bold">Gratis (Cupón aplicado)</span>
              ) : isCalculando ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>📡 Calculando ruta...</span>
              ) : distancia > 0 ? (
                <span>${costoEnvio.toLocaleString()} ({distancia.toFixed(1)} km)</span>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#e65100', fontWeight: 'bold' }}>Ingresa tu dirección para calcular</span>
              )}
            </div>

            {/* Aviso claro cuando el envío no pudo calcularse y se usa el valor por defecto */}
            {!cuponEnvio && !isCalculando && distancia === 0 && formData.direccion.length > 8 && (
              <div style={{ background: '#fff3e0', border: '1px solid #ff9800', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.82rem', color: '#e65100' }}>
                ⚠️ <strong>No pudimos calcular la distancia</strong> para tu dirección. Se aplicará un costo de envío base de <strong>${(10000).toLocaleString()}</strong>. Si crees que es incorrecto, contáctanos antes de pagar.
              </div>
            )}

            {cuponBrownie && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 'bold' }}>
                <span>Cupón: Brownie Gratis</span>
                <span>-$15,000</span>
              </div>
            )}

            {primerViaje && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 'bold' }}>
                <span>🔥 20% OFF (Primer Viaje)</span>
                <span>-${descuentoPrimerViaje.toLocaleString()}</span>
              </div>
            )}

            {cuponRegalo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 'bold' }}>
                <span>Regalo Sorpresa Activado</span>
                <span>¡Incluido!</span>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px dashed #fbc02d', margin: '0.5rem 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-bold text-primary-dark" style={{ fontSize: '1.2rem' }}>Total a transferir:</span>
              <span className="font-bold text-secondary" style={{ fontSize: '1.8rem' }}>${totalCalculado.toLocaleString()}</span>
            </div>
          </div>

          {/* GARANTÍA DE PRIVACIDAD */}
          <div style={{ background: 'rgba(0,0,0,0.8)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', color: 'white', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--color-primary-dark)', padding: '1rem', borderRadius: '50%', display: 'flex' }}>
              <ShieldCheck size={32} className="text-secondary" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'var(--color-secondary)' }}>Garantía de Privacidad 100%</h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Todos nuestros envíos se realizan en cajas genéricas selladas al vacío. Cero olores, cero logos por fuera. Solo tú sabrás lo que hay dentro.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', margin: 0 }}>2. Tus Datos y Comprobante</h3>
          </div>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)' }}>
            Los datos de entrega serán asociados a tu cuenta (<strong>{user?.email}</strong>) para facilitar tus futuras compras.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Nombre Completo" 
              required
              className="checkout-input"
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
            />
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Dirección de Entrega (En Medellín)" 
                required
                className="checkout-input"
                value={formData.direccion} 
                onChange={e => setFormData({...formData, direccion: e.target.value})} 
                onBlur={e => calculateDistance(e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                * El costo de envío se calculará automáticamente al ingresar tu dirección ($1,500/km desde nuestra sede).
              </p>
            </div>
            <input 
              type="tel" 
              placeholder="Número de Teléfono (WhatsApp)" 
              required
              className="checkout-input"
              value={formData.telefono} 
              onChange={e => setFormData({...formData, telefono: e.target.value})} 
            />
            
            <div style={{ marginTop: '1rem' }}>
              <label className="font-bold text-primary-dark" style={{ display: 'block', marginBottom: '0.5rem' }}>Sube la foto del comprobante de transferencia:</label>
              <input 
                type="file" 
                accept="image/*" 
                required
                onChange={e => {
                  const file = e.target.files[0];
                  if (file && file.size > 10 * 1024 * 1024) {
                    alert("La imagen es muy pesada (máximo 10MB). Por favor, toma una captura de pantalla o comprime la imagen.");
                    e.target.value = null;
                    setComprobante(null);
                  } else {
                    setComprobante(file);
                  }
                }}
                style={{ padding: '0.5rem', border: '1px dashed var(--color-primary)', width: '100%', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            {!cumpleMinimo && (
              <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.85rem', color: '#c62828', marginTop: '1.5rem', textAlign: 'center' }}>
                ⚠️ <strong>Compra mínima de $15,000 requerida.</strong> Tu subtotal actual es de ${subtotal.toLocaleString()}. Agrega más productos para continuar.
              </div>
            )}

            <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem', width: '100%', fontSize: '1.2rem' }} disabled={isSubmitting || !cumpleMinimo}>
              {isSubmitting ? 'Enviando Pedido...' : 'Enviar Pedido y Comprobante'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
