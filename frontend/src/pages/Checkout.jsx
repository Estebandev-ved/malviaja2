import { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Banknote, ShieldCheck, Copy, Check, Lock, Eye, EyeOff, Clock, Info, QrCode, ArrowLeft, ArrowRight, ShoppingCart, User, CreditCard, Download, ExternalLink, Smartphone, Building2, HelpCircle } from 'lucide-react';
import { authFetch } from '../api';
import useCountUp from '../utils/useCountUp';


const AnimatedTotal = ({ value }) => {
  const count = useCountUp(value, 600, true);
  return <>{count.toLocaleString()}</>;
};

const STEP_LABELS = ['Carrito', 'Datos y Envío', 'Pago'];
const STEP_ICONS = [ShoppingCart, User, CreditCard];

const CUENTA_NEQUI = '3208303600';
const CUENTA_BANCOLOMBIA = '12345678901';
const TITULAR = '';

const generateRef = () => {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `MV-${year}-${seq}`;
};

const ConfianzaBadges = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
    {[
      { icon: Lock, label: 'Transferencia', sub: 'Segura', color: '#4caf50' },
      { icon: EyeOff, label: 'Envío', sub: 'Discreto', color: '#2196f3' },
      { icon: ShieldCheck, label: 'Datos', sub: 'Cifrados', color: '#9c27b0' },
      { icon: HelpCircle, label: 'Soporte', sub: '24/7', color: '#ff9800' },
    ].map((b, i) => (
      <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-sm)' }}>
        <b.icon size={24} color={b.color} style={{ marginBottom: '0.25rem' }} />
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{b.label}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>{b.sub}</div>
      </div>
    ))}
  </div>
);

const PaymentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Cómo pagar</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button style={{ flex: 1, padding: '0.75rem', border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Nequi</button>
          <button style={{ flex: 1, padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: 'var(--radius-md)', background: 'white', color: '#666', fontWeight: 600, cursor: 'pointer' }}>Bancolombia</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { step: '1', title: 'Abre Nequi', desc: 'Ingresa a la app de Nequi en tu celular.' },
            { step: '2', title: 'Elige "Enviar"', desc: 'Selecciona la opción enviar dinero desde el menú principal.' },
            { step: '3', title: 'Ingresa el número', desc: `Digita el número: ${CUENTA_NEQUI} (Titular: ${TITULAR}).` },
            { step: '4', title: 'Digita el valor exacto', desc: 'Transfiere el valor exacto que aparece en "Total a transferir".' },
            { step: '5', title: 'Incluye la referencia', desc: 'En la nota de la transferencia, escribe tu referencia única para identificación automática.' },
            { step: '6', title: 'Toma captura', desc: 'Antes de salir, toma una captura de pantalla del comprobante exitoso.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{s.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn--primary w-full" style={{ marginTop: '1.5rem' }} onClick={onClose}>Entendido</button>
      </div>
    </div>
  );
};

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: 'none', background: copied ? '#4caf50' : 'var(--color-primary)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado' : label}
    </button>
  );
};

const LineItem = ({ label, value }) => {
  const isObj = typeof value === 'object';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.2rem 0' }}>
      <span style={{ fontSize: '0.9rem', color: '#666' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: isObj ? value.color : 'var(--color-text)' }}>
        {isObj ? value.text : value}
      </span>
    </div>
  );
};

const Timer = ({ minutes = 15, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) { onExpire?.(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = timeLeft / (minutes * 60);
  const isUrgent = timeLeft < 120;

  if (timeLeft <= 0) return null;

  return (
    <div style={{
      maxWidth: '360px', margin: '0 auto 2rem', textAlign: 'center',
      padding: '1.5rem 2rem',
      borderRadius: 'var(--radius-xl)',
      background: isUrgent
        ? 'linear-gradient(135deg, #ffebee, #ffcdd2)'
        : 'linear-gradient(135deg, #fff8e1, #fff3e0)',
      border: `1px solid ${isUrgent ? '#ef9a9a' : '#ffcc80'}`,
      boxShadow: isUrgent
        ? '0 8px 24px rgba(198,40,40,0.15)'
        : '0 8px 24px rgba(255,152,0,0.12)',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: isUrgent ? '#c62828' : '#e65100',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 0.75rem',
        animation: isUrgent ? 'pulse-urgent 1s ease-in-out infinite' : 'none',
      }}>
        <Clock size={32} color="white" />
      </div>
      <div style={{
        fontSize: '2.2rem', fontWeight: 800,
        color: isUrgent ? '#c62828' : '#e65100',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '2px',
      }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
        Stock reservado por {minutes} minutos
      </div>
      <div style={{
        marginTop: '0.75rem', height: '4px', background: '#fff',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: isUrgent ? '#c62828' : 'linear-gradient(90deg, #fbc02d, #e65100)',
          borderRadius: '2px', transition: 'width 1s linear',
        }} />
      </div>
    </div>
  );
};

const PDFReceipt = ({ pedido, referencia, onClose }) => {
  const generarPDF = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const element = document.getElementById('receipt-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff8e1' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a5');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`recibo-${referencia}.pdf`);
  }, [referencia]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <div id="receipt-content" style={{ background: '#fff8e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontFamily: 'monospace', border: '1px solid #fbc02d' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px dashed #fbc02d', paddingBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3e2723' }}>Malviaja2</div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>Club de Comestibles Premium</div>
          </div>
          <div style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            <div><strong>Orden:</strong> {referencia}</div>
            <div><strong>Fecha:</strong> {new Date().toLocaleString('es-CO')}</div>
            <div><strong>Cliente:</strong> {pedido.nombreReceptor}</div>
            {pedido.direccionEnvio && <div><strong>Dirección:</strong> {pedido.direccionEnvio}</div>}
          </div>
          <div style={{ borderTop: '1px solid #fbc02d', borderBottom: '1px solid #fbc02d', padding: '0.5rem 0', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
            {pedido.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.cantidad}x {item.nombre}</span>
                <span>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: '#3e2723' }}>
            <span>TOTAL</span>
            <span>${(pedido.total || 0).toLocaleString('es-CO')}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.75rem', borderTop: '2px dashed #fbc02d', paddingTop: '0.5rem', fontSize: '0.7rem', color: '#999' }}>
            <div>⋆ ｡°✩ Recibo Digital Malviaja2 ✩°｡ ⋆</div>
            <div style={{ fontSize: '0.65rem' }}>Gracias por confiar en nosotros. ¡Buen viaje!</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn--primary" style={{ flex: 1 }} onClick={generarPDF}><Download size={16} style={{ marginRight: '0.5rem' }} />Descargar PDF</button>
          <button className="btn" style={{ flex: 1, border: '1px solid #ddd' }} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { carrito, clearCart, user, cuponesActivos, usarCupon } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [referencia, setReferencia] = useState('');
  const [formData, setFormData] = useState({
    nombre: user ? user.displayName : '',
    direccion: '',
    telefono: ''
  });
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [primerViaje, setPrimerViaje] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [pedidoActual, setPedidoActual] = useState(null);

  useEffect(() => {
    setReferencia(generateRef());
    if (!user) { navigate('/login'); return; }
    const fetchPerfil = async () => {
      try {
        const res = await authFetch(`/api/pedidos/usuario/${user.uid}/perfil`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, direccion: data.direccionPorDefecto || '', telefono: data.telefonoPorDefecto || '' }));
          setPrimerViaje(!data.primerCompraRealizada);
        }
      } catch (e) { console.error("Error obteniendo perfil", e); }
    };
    fetchPerfil();
  }, [user, navigate]);

  const [distancia, setDistancia] = useState(0);
  const [isCalculando, setIsCalculando] = useState(false);

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const cuponEnvio = cuponesActivos.find(c => c.id === 'envio');
  const originMedellin = { lat: 6.2442, lon: -75.5812 };
  const valorKm = 1500;

  const calculateDistance = async (address) => {
    if (!address || address.length < 8) return;
    setIsCalculando(true);
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Medellín")}`);
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) throw new Error("Dirección no encontrada");
      const dest = { lat: geoData[0].lat, lon: geoData[0].lon };
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${originMedellin.lon},${originMedellin.lat};${dest.lon},${dest.lat}?overview=false`);
      const routeData = await routeRes.json();
      if (routeData.code !== 'Ok') throw new Error("Error en ruta");
      setDistancia(routeData.routes[0].distance / 1000);
    } catch (err) {
      console.warn("No se pudo calcular la distancia exacta:", err.message);
      setDistancia(0);
    } finally { setIsCalculando(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => calculateDistance(formData.direccion), 1500);
    return () => clearTimeout(timer);
  }, [formData.direccion]);

  const costoEnvio = cuponEnvio ? 0 : (distancia > 0 ? Math.round(distancia * valorKm) : 10000);
  const cuponRegalo = cuponesActivos.find(c => c.id === 'regalo');
  const cuponBrownie = cuponesActivos.find(c => c.id === 'brownie');
  const descuentoBrownie = cuponBrownie ? 15000 : 0;
  const descuentoPrimerViaje = primerViaje ? Math.round(subtotal * 0.20) : 0;
  let totalCalculado = subtotal + costoEnvio - descuentoBrownie - descuentoPrimerViaje;
  if (totalCalculado < 0) totalCalculado = 0;
  const cumpleMinimo = subtotal >= 15000;

  if (!user && !success) { navigate('/login'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comprobante) { alert("Por favor, sube el comprobante de pago."); return; }
    setIsSubmitting(true);
    const form = new FormData();
    form.append("userId", user.uid);
    form.append("email", user.email || '');
    form.append("nombre", formData.nombre);
    form.append("direccion", formData.direccion);
    form.append("telefono", formData.telefono);
    form.append("total", totalCalculado);
    form.append("comprobante", comprobante);
    form.append("carrito", JSON.stringify(carrito));
    form.append("referencia", referencia);

    try {
      const response = await authFetch('/api/pedidos/checkout', { method: 'POST', body: form });
      if (response.status === 409) {
        const errorData = await response.json();
        alert(`⚠️ No podemos procesar tu pedido:\n\n${errorData.error}\n\nPor favor ajusta tu carrito.`);
        setIsSubmitting(false); return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al enviar el pedido');
      }
      const data = await response.json();
      const refBackend = data.referencia || referencia;
      if (cuponEnvio) usarCupon(cuponEnvio.cupoId);
      if (cuponRegalo) usarCupon(cuponRegalo.cupoId);
      if (cuponBrownie) usarCupon(cuponBrownie.cupoId);
      setPedidoActual({ ...data, items: carrito, referencia: refBackend });
      setReferencia(refBackend);
      setSuccess(true);
      clearCart();
    } catch (error) {
      alert(`Hubo un error procesando tu pedido:\n${error.message}`);
      console.error(error);
    } finally { setIsSubmitting(false); }
  };

  if (carrito.length === 0 && !success) {
    return (
      <div style={{ background: 'linear-gradient(180deg, #fff8e1 0%, #f5efe0 100%)', minHeight: '100vh' }}>
      <div className="container py-16 text-center">
        <h2 className="section-title">Tu carrito está vacío</h2>
        <button className="btn btn--primary" onClick={() => navigate('/comestibles')}>Ir a comprar</button>
      </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: 'linear-gradient(180deg, #fff8e1 0%, #f5efe0 100%)', minHeight: '100vh' }}>
      <div className="container py-16 text-center">
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)' }}>
          <CheckCircle2 size={64} className="text-secondary" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="text-primary font-bold" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>¡Pedido Recibido!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Ref: <span style={{ fontFamily: 'monospace' }}>{referencia}</span>
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-light)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Hemos recibido tu orden y el comprobante. Te notificaremos cuando el pago sea verificado.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn--secondary" onClick={() => setShowReceipt(true)}><Download size={16} style={{ marginRight: '0.5rem' }} />Descargar Recibo</button>
            <button className="btn btn--primary" onClick={() => navigate('/perfil')}>Rastrear mi pedido</button>
            <button className="btn" style={{ border: '1px solid #ddd' }} onClick={() => navigate('/')}>Volver al Inicio</button>
          </div>
          {showReceipt && pedidoActual && <PDFReceipt pedido={pedidoActual} referencia={referencia} onClose={() => setShowReceipt(false)} />}
        </div>
      </div>
      </div>
    );
  }

  const canGoNext = () => {
    if (step === 0) return carrito.length > 0;
    if (step === 1) return formData.nombre && formData.direccion && formData.telefono;
    return true;
  };

  return (
    <div style={{ background: 'linear-gradient(180deg, #fff8e1 0%, #f5efe0 100%)', minHeight: '100vh' }}>
    <div className="container py-16">
      <h1 className="section-title text-center" style={{ marginBottom: '0.5rem' }}>Finalizar Compra</h1>
      <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Ref: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-primary)' }}>{referencia}</span>
      </p>

      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', gap: '0.5rem' }}>
        {STEP_LABELS.map((label, i) => {
          const Icon = STEP_ICONS[i];
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {i > 0 && <div style={{ width: '32px', height: '2px', background: isDone ? 'var(--color-primary)' : '#e0e0e0' }} />}
              <button onClick={() => { if (i < step || (i === step)) setStep(i); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '999px', border: `2px solid ${isActive || isDone ? 'var(--color-primary)' : '#e0e0e0'}`, background: isActive ? 'var(--color-primary)' : isDone ? 'var(--color-primary-light)' : 'white', color: isActive || isDone ? 'white' : '#999', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.3s' }}>
                <Icon size={16} />
                <span className="desktop-only">{label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Timer */}
      <Timer minutes={15} onExpire={() => alert('⏰ Se agotó el tiempo de reserva. Tu carrito sigue guardado, pero el stock ya no está reservado.')} />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Step 0: Carrito */}
        {step === 0 && (
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>🛒 Tu Carrito</h3>
            {carrito.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.nombre}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{item.cantidad}x ${item.precio.toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${(item.precio * item.cantidad).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
              Subtotal: ${subtotal.toLocaleString()}
            </div>
            <button className="btn btn--primary w-full" style={{ marginTop: '1.5rem' }} onClick={() => setStep(1)} disabled={!canGoNext()}>
              Continuar con Datos <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        )}

        {/* Step 1: Datos */}
        {step === 1 && (
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>📍 Datos de Entrega</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nombre Completo" required className="checkout-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <div>
                <input type="text" placeholder="Dirección de Entrega (En Medellín)" required className="checkout-input" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} onBlur={e => calculateDistance(e.target.value)} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>El costo de envío se calculará automáticamente ($1,500/km desde nuestra sede).</p>
              </div>
              <input type="tel" placeholder="Número de Teléfono (WhatsApp)" required className="checkout-input" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button className="btn" style={{ border: '1px solid #ddd', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setStep(0)}>
                  <ArrowLeft size={18} /> Atrás
                </button>
                <button className="btn btn--primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setStep(2)} disabled={!canGoNext()}>
                  Ir a Pago <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pago */}
        {step === 2 && (
          <div>
            {/* Confianza badges */}
            <ConfianzaBadges />

            <div className="glass" style={{ padding: 'clamp(1rem, 4vw, 2rem)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Banknote className="text-secondary" />
                <h3 className="text-primary font-bold" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', margin: 0 }}>Pago</h3>
              </div>

              <div style={{ background: '#fff8e1', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fbc02d' }}>
                
                {/* Botón mostrar QR */}
                <button 
                  className="btn btn--secondary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: showQR ? '1rem' : 0, padding: '0.65rem', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)' }} 
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode size={18} /> {showQR ? 'Ocultar QR' : 'Pagar con QR'}
                </button>

                {showQR && (
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      background: 'white',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <img 
                        src="/qr-nequi.png.jpeg" 
                        alt="QR Nequi" 
                        style={{ 
                          maxWidth: '75vw',
                          maxHeight: '70vh',
                          width: 'auto',
                          height: 'auto',
                          display: 'block'
                        }} 
                      />
                    </div>
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px dashed #fbc02d', margin: showQR ? '0 0 1rem' : '0.5rem 0 1rem' }} />

                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Nequi / Bancolombia</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: 'clamp(1rem, 4vw, 1.2rem)', color: 'var(--color-primary-dark)' }}>{CUENTA_NEQUI}</span>
                    <CopyButton text={CUENTA_NEQUI} label="Copiar" />
                  </div>
                  {!TITULAR && <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.4rem' }}>Sin titular registrado</p>}
                  {TITULAR && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.4rem' }}>Titular: {TITULAR}</p>}
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed #fbc02d', margin: '1rem 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <LineItem label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                  <LineItem label="Envío" value={cuponEnvio ? { text: 'Gratis (Cupón)', color: '#fbc02d' } : isCalculando ? { text: 'Calculando... 📡', color: '#fbc02d' } : distancia > 0 ? { text: `$${costoEnvio.toLocaleString()} (${distancia.toFixed(1)} km)`, color: '#e65100' } : { text: 'Ingresa tu dirección', color: '#e65100' }} />
                  {!cuponEnvio && !isCalculando && distancia === 0 && formData.direccion.length > 8 && (
                    <div style={{ background: '#fff3e0', border: '1px solid #ff9800', borderRadius: 'var(--radius-sm)', padding: '0.6rem', fontSize: '0.78rem', color: '#e65100' }}>
                      ⚠️ No pudimos calcular la distancia. Se aplicará envío base de ${(10000).toLocaleString()}.
                    </div>
                  )}
                  {cuponBrownie && <LineItem label="🎁 Brownie Gratis" value={{ text: '-$15,000', color: '#4caf50' }} />}
                  {primerViaje && <LineItem label="🔥 20% OFF (Primer Viaje)" value={{ text: `-$${descuentoPrimerViaje.toLocaleString()}`, color: '#4caf50' }} />}
                  {cuponRegalo && <LineItem label="🎀 Regalo Sorpresa" value={{ text: '¡Incluido!', color: '#4caf50' }} />}
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed #fbc02d', margin: '1rem 0' }} />
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'linear-gradient(135deg, #3e2723, #5d4037)',
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.85rem, 3vw, 1rem)', color: '#fbc02d' }}>Total a transferir</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', color: '#fbc02d' }}>$<AnimatedTotal value={totalCalculado} /></span>
                    <CopyButton text={totalCalculado.toLocaleString()} label="Copiar monto" />
                  </div>
                </div>

                <button className="btn" style={{ width: '100%', marginTop: '1rem', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }} onClick={() => setShowPagoModal(true)}>
                  <Info size={18} /> ¿Cómo pagar?
                </button>
              </div>

              {/* Datos + Comprobante */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Confirma tus datos y sube el comprobante</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                  Tus datos serán asociados a tu cuenta (<strong>{user?.email}</strong>).
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" placeholder="Nombre Completo" required className="checkout-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  <input type="text" placeholder="Dirección de Entrega (En Medellín)" required className="checkout-input" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} onBlur={e => calculateDistance(e.target.value)} />
                  <input type="tel" placeholder="Número de Teléfono (WhatsApp)" required className="checkout-input" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />

                  <div>
                    <label className="font-bold text-primary-dark" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Sube la foto del comprobante de transferencia:
                    </label>
                    <div style={{ border: '2px dashed var(--color-primary-light)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', background: comprobante ? '#f1f8e9' : '#fafafa', cursor: 'pointer' }} onClick={() => document.getElementById('file-input').click()}>
                      {comprobantePreview ? (
                        <img src={comprobantePreview} alt="Comprobante" style={{ maxHeight: '150px', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
                      ) : (
                        <div style={{ color: 'var(--color-text-light)' }}>
                          <CreditCard size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                          <p>Haz clic para subir la captura de tu transferencia</p>
                          <p style={{ fontSize: '0.75rem' }}>Máximo 10MB, formato imagen</p>
                        </div>
                      )}
                      <input id="file-input" type="file" accept="image/*" required style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files[0];
                        if (file && file.size > 10 * 1024 * 1024) { alert("La imagen es muy pesada (máximo 10MB)."); e.target.value = null; setComprobante(null); setComprobantePreview(null); }
                        else { setComprobante(file); setComprobantePreview(URL.createObjectURL(file)); }
                      }} />
                    </div>
                  </div>

                  {!cumpleMinimo && (
                    <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.85rem', color: '#c62828', textAlign: 'center' }}>
                      ⚠️ <strong>Compra mínima de $15,000 requerida.</strong> Tu subtotal actual es de ${subtotal.toLocaleString()}.
                    </div>
                  )}

                  <button type="submit" className="btn btn--primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }} disabled={isSubmitting || !cumpleMinimo}>
                    {isSubmitting ? 'Enviando Pedido...' : 'Enviar Pedido y Comprobante'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentModal isOpen={showPagoModal} onClose={() => setShowPagoModal(false)} />
    </div>
    </div>
  );
};

export default Checkout;
