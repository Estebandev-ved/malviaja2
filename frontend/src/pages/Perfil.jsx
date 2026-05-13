import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { authFetch } from '../api';
import { User, LogOut, Package, MapPin, Phone, Award, Star, BookOpen, Gift, Send, Ticket, Crown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MisPedidos from './MisPedidos';
import useCountUp from '../utils/useCountUp';
import './Perfil.css';

const AnimatedNumber = ({ value }) => {
  const count = useCountUp(value, 800, true);
  return <>{count.toLocaleString()}</>;
};

const Perfil = () => {
  const { user, logout, puntosTotales, cuponesActivos, addPuntos, restarPuntos, addCupon } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recompensas');
  const [perfilDb, setPerfilDb] = useState(null);

  // Estados Locales UI Gamificación
  const [codigoPromo, setCodigoPromo] = useState('');
  const [mensajePromo, setMensajePromo] = useState(null);
  
  // Detalle de Cupón (Modal)
  const [cuponSeleccionado, setCuponSeleccionado] = useState(null);

  // Estado para el Diario
  const [diario, setDiario] = useState([
    { id: 1, fecha: '2023-10-12', dosis: '30mg', producto: 'Brownie Clásico', efecto: 'Relajación profunda, ideal para dormir', calificacion: 5 }
  ]);
  const [nuevaNota, setNuevaNota] = useState({ dosis: '', producto: '', efecto: '', calificacion: 5 });

  // Catálogo de Recompensas
  const catalogoRecompensas = [
    { id: 'boleto', nombre: 'Boleto Dorado', descripcion: '1 ticket para la mega-rifa mensual de Malviaja2.', costo: 500, icono: Ticket },
    { id: 'envio', nombre: 'Envío Gratis', descripcion: 'Tu próximo pedido sin costo de domicilio.', costo: 1000, icono: Package },
    { id: 'regalo', nombre: 'Regalo Sorpresa', descripcion: 'Añadimos un mini-comestible secreto a tu envío.', costo: 2000, icono: Gift },
    { id: 'vip', nombre: 'Pase VIP "Catador"', descripcion: 'Acceso temprano y muestra de nuevos sabores.', costo: 3000, icono: Crown },
    { id: 'brownie', nombre: 'Brownie Gratis', descripcion: 'Un Brownie Clásico o A Tu Medida totalmente gratis.', costo: 5000, icono: Star },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPerfil = async () => {
      try {
        const res = await authFetch(`/api/pedidos/usuario/${user.uid}/perfil`);
        if (res.ok) {
          const data = await res.json();
          setPerfilDb(data);
        }
      } catch (e) {
        console.error("Error obteniendo perfil", e);
      }
    };
    fetchPerfil();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const reclamarCodigo = (e) => {
    e.preventDefault();
    if (codigoPromo.trim().length < 5) {
      setMensajePromo({ tipo: 'error', texto: 'Código inválido. Revisa tu empaque.' });
      setTimeout(() => setMensajePromo(null), 3000);
      return;
    }
    // Simular reclamo exitoso
    setTimeout(() => {
      addPuntos(500);
      setMensajePromo({ tipo: 'exito', texto: '¡Código validado! Has ganado 500 Puntos de Vuelo 🚀' });
      setCodigoPromo('');
      setTimeout(() => setMensajePromo(null), 4000);
    }, 1000);
  };

  const canjearPremio = (premio) => {
    if (puntosTotales >= premio.costo) {
      restarPuntos(premio.costo);
      addCupon(premio);
      
      setMensajePromo({ tipo: 'exito', texto: `¡Felicidades! Has canjeado: ${premio.nombre}. Revisa tus premios guardados.` });
      setTimeout(() => setMensajePromo(null), 5000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const agregarNotaDiario = (e) => {
    e.preventDefault();
    if (!nuevaNota.dosis || !nuevaNota.efecto) return;
    const nota = { 
      id: Date.now(), 
      fecha: new Date().toISOString().split('T')[0],
      ...nuevaNota 
    };
    setDiario([nota, ...diario]);
    setNuevaNota({ dosis: '', producto: '', efecto: '', calificacion: 5 });
  };

  if (!user) return null;

  return (
    <div className="container py-8" style={{ paddingBottom: '4rem' }}>
      <div className="perfil-layout">
        
        {/* Sidebar de Perfil */}
        <div className="perfil-sidebar">
          <div className="perfil-card glass">
            <div className="text-center" style={{ marginBottom: '2rem' }}>
              <div style={{ width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-secondary)' }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={48} color="var(--color-secondary)" />
                  </div>
                )}
              </div>
              <h2 className="text-primary-dark font-bold" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                {user.displayName || perfilDb?.nombre || 'Viajero Trip'}
              </h2>
              {(() => {
                let nivel = 'Turista';
                let colorBg = '#e0e0e0';
                let colorText = '#424242';
                
                if (puntosTotales >= 5000) {
                  nivel = 'Astronauta VIP';
                  colorBg = '#FFD700'; // Dorado VIP
                  colorText = '#000000';
                } else if (puntosTotales >= 2000) {
                  nivel = 'Explorador';
                  colorBg = '#C0C0C0'; // Plateado
                  colorText = '#000000';
                }

                return (
                  <div style={{ display: 'inline-block', background: colorBg, color: colorText, padding: '0.3rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    Nivel: {nivel}
                  </div>
                );
              })()}

              {perfilDb && perfilDb.activo === false && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginTop: '1.5rem', textAlign: 'left', border: '1px solid #ffcdd2', lineHeight: '1.5' }}>
                  ⚠️ <strong>Cuenta en Riesgo de Suspensión:</strong><br/>
                  Llevas más de 15 días inactivo. Haz un pedido mínimo de $15.000 para mantener tu membresía en el club Malviaja2 y evitar perder tus puntos.
                </div>
              )}
            </div>

            <div className="sidebar-menu">
              <button onClick={() => setActiveTab('recompensas')} className={`perfil-menu-btn ${activeTab === 'recompensas' ? 'active' : ''}`}>
                <Award size={20} style={{ marginRight: '1rem' }} /> Mis Recompensas
              </button>
              
              <button onClick={() => setActiveTab('pedidos')} className={`perfil-menu-btn ${activeTab === 'pedidos' ? 'active' : ''}`}>
                <Package size={20} style={{ marginRight: '1rem' }} /> Historial de Viajes
              </button>
              
              <button onClick={() => setActiveTab('diario')} className={`perfil-menu-btn ${activeTab === 'diario' ? 'active' : ''}`}>
                <BookOpen size={20} style={{ marginRight: '1rem' }} /> Diario de Viaje
              </button>

              <button onClick={() => setActiveTab('info')} className={`perfil-menu-btn ${activeTab === 'info' ? 'active' : ''}`}>
                <MapPin size={20} style={{ marginRight: '1rem' }} /> Ajustes y Envío
              </button>
              
              <button onClick={handleLogout} className="perfil-menu-btn danger" style={{ marginTop: '2rem' }}>
                <LogOut size={20} style={{ marginRight: '1rem' }} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="perfil-content">
          
          {/* TAB: RECOMPENSAS */}
          {activeTab === 'recompensas' && (
            <div className="animation-fade">
              
              {mensajePromo && (
                <div className={`promo-msg-global ${mensajePromo.tipo}`}>
                  {mensajePromo.texto}
                </div>
              )}

              <div className="points-header glass">
                <div className="points-display">
                  <span className="points-label">Puntos de Vuelo Disponibles</span>
                  <div className="points-value">
                    <Star size={36} fill="var(--color-secondary)" color="var(--color-secondary)" /> 
                    <AnimatedNumber value={puntosTotales} />
                  </div>
                </div>
                
                <div className="code-redeem">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>¿Tienes un código secreto?</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>Búscalo dentro del empaque de tu último pedido.</p>
                  <form onSubmit={reclamarCodigo} className="code-form">
                    <input 
                      type="text" 
                      placeholder="Ej. TRIP-XXXX" 
                      value={codigoPromo}
                      onChange={(e) => setCodigoPromo(e.target.value.toUpperCase())}
                      className="code-input"
                    />
                    <button type="submit" className="btn btn--secondary code-btn">Reclamar</button>
                  </form>
                </div>
              </div>

              {/* SECCIÓN PREMIOS GUARDADOS */}
              {cuponesActivos.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                  <h2 className="section-title text-primary-dark" style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={24} className="text-secondary" /> Mis Premios y Cupones Activos
                  </h2>
                  <div className="cupones-grid">
                    {cuponesActivos.map((cupon) => (
                      <div key={cupon.cupoId} className="cupon-card glass-dark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                          <div className="cupon-icon">
                            {cupon.icono ? <cupon.icono size={24} /> : <Award size={24} />}
                          </div>
                          <div className="cupon-details" style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>{cupon.nombre}</h4>
                            <p style={{ fontSize: '0.8rem', margin: 0 }}>{cupon.id === 'boleto' ? 'Válido para la Mega-Rifa' : 'Aplicable en Carrito'}</p>
                          </div>
                          <CheckCircle2 size={24} className="text-secondary" />
                        </div>
                        
                        {/* Explicación Detallada del Premio */}
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-sm)', width: '100%', fontSize: '0.85rem', color: 'var(--color-text)', borderLeft: '3px solid var(--color-primary)' }}>
                          {cupon.id === 'boleto' && <div><strong>🎟️ Tu Número de Ticket:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--color-primary)' }}>#TKT-{cupon.cupoId.toString().slice(-4)}</span><br/><br/>El ganador se anunciará a fin de mes. ¡Guarda tu número!</div>}
                          {cupon.id === 'vip' && <div><strong>👑 Estatus VIP Activado:</strong><br/>Recibirás un correo la próxima semana para reclamar tu muestra secreta antes de que salga al público general.</div>}
                          {(cupon.id === 'envio' || cupon.id === 'brownie' || cupon.id === 'regalo') && <div><strong>Uso Automático:</strong> Este beneficio está vinculado a tu cuenta y se descontará automáticamente en tu próximo carrito de compras.</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATÁLOGO DE RECOMPENSAS */}
              <h2 className="section-title text-primary-dark" style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: 'clamp(1.3rem, 5vw, 1.8rem)' }}>Catálogo de Recompensas</h2>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>Canjea tus Puntos de Vuelo por estos beneficios exclusivos.</p>
              
              <div className="rewards-grid">
                {catalogoRecompensas.map((premio) => (
                  <div key={premio.id} className={`reward-card glass ${puntosTotales >= premio.costo ? 'unlocked' : 'locked'}`}>
                    <div className="reward-icon">
                      <premio.icono size={32} />
                    </div>
                    <h3>{premio.nombre}</h3>
                    <p>{premio.descripcion}</p>
                    <div className="reward-cost">{premio.costo.toLocaleString()} Puntos</div>
                    <button 
                      className="btn w-full" 
                      disabled={puntosTotales < premio.costo}
                      onClick={() => canjearPremio(premio)}
                    >
                      {puntosTotales >= premio.costo ? 'Canjear Premio' : `Faltan ${premio.costo - puntosTotales} pts`}
                    </button>
                  </div>
                ))}
              </div>

              {/* PROGRAMA DE REFERIDOS */}
              <div className="referidos-section" style={{ marginTop: '4rem', padding: '2.5rem', background: 'var(--color-primary-dark)', borderRadius: 'var(--radius-lg)', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={28} className="text-secondary" /> Invita a un Viajero</h2>
                  <p style={{ opacity: 0.9, marginBottom: '1.5rem', lineHeight: '1.5' }}>Gana <strong>2,000 Puntos de Vuelo</strong> automáticos cada vez que un amigo haga su primera compra usando tu enlace personal.</p>
                </div>
                <div className="referidos-link-box" style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Tu enlace único de invitación:</div>
                  <div style={{ padding: '1rem', background: 'white', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '1rem', fontSize: 'clamp(0.75rem, 2.5vw, 1rem)', wordBreak: 'break-all' }}>
                    malviaja2.com/ref/{user.uid?.slice(0, 8) || 'user'}
                  </div>
                  <button className="btn btn--secondary w-full" onClick={() => {
                    navigator.clipboard.writeText(`https://malviaja2.com/ref/${user.uid?.slice(0,8) || 'user'}`);
                    alert("Enlace copiado al portapapeles. ¡Mándaselo a tus amigos!");
                  }}>Copiar Enlace</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="perfil-card glass animation-fade">
              <MisPedidos isEmbedded={true} />
            </div>
          )}

          {/* TAB: DIARIO DE VIAJE */}
          {activeTab === 'diario' && (
            <div className="perfil-card glass animation-fade">
              <h2 className="text-primary-dark font-bold" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={28} className="text-primary" />
                Diario de Viaje
              </h2>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                Anota cómo te sentiste con diferentes dosis y productos. Solo tú puedes ver esto, es tu guía personal para encontrar la dosis perfecta.
              </p>

              <form onSubmit={agregarNotaDiario} className="diary-form glass-dark">
                <h3 className="text-surface font-bold" style={{ marginBottom: '1rem' }}>Nueva Anotación</h3>
                <div className="diary-form-grid">
                  <input type="text" placeholder="Producto (Ej. Brownie clásico)" className="checkout-input" value={nuevaNota.producto} onChange={e => setNuevaNota({...nuevaNota, producto: e.target.value})} required />
                  <input type="text" placeholder="Dosis consumida (Ej. 30mg)" className="checkout-input" value={nuevaNota.dosis} onChange={e => setNuevaNota({...nuevaNota, dosis: e.target.value})} required />
                </div>
                <textarea placeholder="¿Cómo te sentiste? ¿Cuánto duró el efecto?" className="checkout-input" style={{ minHeight: '100px', marginBottom: '1rem', resize: 'vertical' }} value={nuevaNota.efecto} onChange={e => setNuevaNota({...nuevaNota, efecto: e.target.value})} required />
                <button type="submit" className="btn btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={18} /> Guardar Nota
                </button>
              </form>

              <div className="diary-entries" style={{ marginTop: '3rem' }}>
                {diario.map(nota => (
                  <div key={nota.id} className="diary-entry">
                    <div className="diary-date">{nota.fecha}</div>
                    <h4 className="text-primary-dark font-bold" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{nota.producto} <span style={{ color: 'var(--color-primary-light)', fontWeight: 'normal', fontSize: '1rem' }}>({nota.dosis})</span></h4>
                    <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic', background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>"{nota.efecto}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INFO (DATOS) */}
          {activeTab === 'info' && (
            <div className="perfil-card glass animation-fade">
              <h2 className="text-primary-dark font-bold" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={28} className="text-primary" />
                Ajustes y Envío
              </h2>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                Tus datos de contacto principales. Se guardan automáticamente en tu último pedido exitoso para agilizar futuras compras.
              </p>
              
              <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="info-item">
                  <label className="info-label">Nombre</label>
                  <div className="info-value">{perfilDb?.nombre || user.displayName || 'No registrado'}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Correo</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-item">
                  <label className="info-label" style={{ color: 'var(--color-primary)' }}>Teléfono (Último pedido)</label>
                  <div className="info-value">
                    <Phone size={18} style={{ marginRight: '0.5rem' }} /> {perfilDb?.telefonoPorDefecto || 'Se guardará en tu próximo viaje'}
                  </div>
                </div>
                <div className="info-item">
                  <label className="info-label" style={{ color: 'var(--color-primary)' }}>Dirección (Último pedido)</label>
                  <div className="info-value">
                    <MapPin size={18} style={{ marginRight: '0.5rem' }} /> {perfilDb?.direccionPorDefecto || 'Se guardará en tu próximo viaje'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
