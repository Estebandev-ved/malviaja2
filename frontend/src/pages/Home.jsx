import { Link } from 'react-router-dom';
import { Star, Target, Sparkles, FlaskConical, Clock, ShieldCheck, Zap, Lock, Percent, Timer, Megaphone, Trophy, Gift, ShoppingBag, Users, CheckCircle2, Crown, BadgeCheck, ArrowUpRight, Package, Info, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useStore from '../store/useStore';
import { apiFetch, authFetch } from '../api';
import './Home.css';

const TIPO_ICONOS = {
  sorteo: { icon: Trophy, color: '#ff9800', label: '🎟️ Sorteo' },
  descuento: { icon: Gift, color: '#4caf50', label: '🔥 Descuento' },
  nuevo_producto: { icon: ShoppingBag, color: '#2196f3', label: '🍫 Nuevo' },
  general: { icon: Megaphone, color: '#9c27b0', label: '📢 Novedad' },
};

const Home = () => {
  const user = useStore(state => state.user);
  const authLoading = useStore(state => state.authLoading);
  const puntosTotales = useStore(state => state.puntosTotales);
  const rachaDias = useStore(state => state.rachaDias);
  const totalPedidos = useStore(state => state.totalPedidos);
  const [noticias, setNoticias] = useState([]);
  const heroRef = useRef(null);
  const mascotRef = useRef(null);
  const blobRef = useRef(null);
  const [promoConfig, setPromoConfig] = useState(null);
  const [recentPedidos, setRecentPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3500);
  };

  const tiers = [
    { id: 'bronce', label: 'Bronce', min: 0, max: 1999 },
    { id: 'plata', label: 'Plata', min: 2000, max: 4999 },
    { id: 'oro', label: 'Oro', min: 5000, max: 7999 },
    { id: 'vip', label: 'VIP', min: 8000, max: Infinity }
  ];
  const puntos = Number.isFinite(Number(puntosTotales)) ? Number(puntosTotales) : 0;
  const currentTier = tiers.find(t => puntos >= t.min && puntos <= t.max) || tiers[0];
  const nextTier = tiers.find(t => puntos < t.min);
  const progressToNext = nextTier ? Math.min(100, Math.round(((puntos - currentTier.min) / (nextTier.min - currentTier.min)) * 100)) : 100;

  useEffect(() => {
    const loadNoticias = async () => {
      try {
        const res = await apiFetch('/api/noticias/publicas');
        if (res.ok) {
          const data = await res.json();
          setNoticias(data.slice(0, 6));
        }
      } catch (e) {
        console.warn('No se pudo cargar noticias publicas:', e.message);
      }
    };
    loadNoticias();
  }, []);

  useEffect(() => {
    const loadPedidos = async () => {
      if (!user?.uid) return;
      setLoadingPedidos(true);
      try {
        const res = await authFetch(`/api/pedidos/usuario/${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setRecentPedidos(Array.isArray(data) ? data.slice(0, 4) : []);
        }
      } catch (e) {
        console.warn('No se pudo cargar pedidos recientes:', e.message);
      } finally {
        setLoadingPedidos(false);
      }
    };
    loadPedidos();
  }, [user?.uid]);

  useEffect(() => {
    const loadPromo = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await apiFetch('/api/configuracion/publica', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setPromoConfig(data);
        }
      } catch (e) {
        console.warn('No se pudo cargar promo publica:', e.message);
      }
    };
    loadPromo();
    const interval = setInterval(loadPromo, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleScroll = () => {
      const rect = hero.getBoundingClientRect();
      const progress = -rect.top / (rect.height + window.innerHeight);

      if (mascotRef.current) {
        mascotRef.current.style.transform = `translateY(${progress * 50}px)`;
      }
      if (blobRef.current) {
        const blob = blobRef.current;
        blob.style.transform = `translate(${progress * -30}px, ${progress * 40}px) scale(${1 + progress * 0.15})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const applyTilt = () => {
      const cards = document.querySelectorAll('[data-tilt]:not(.tilt-applied)');
      cards.forEach(card => {
        card.classList.add('tilt-applied');
        
        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / 10).toFixed(1)}deg) rotateY(${((centerX - x) / 10).toFixed(1)}deg) scale3d(1.02,1.02,1.02)`;
        };

        const onLeave = () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        };

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
      });
    };

    applyTilt();
    const observer = new MutationObserver(applyTilt);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);


  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / 12).toFixed(1)}deg) rotateY(${((centerX - x) / 12).toFixed(1)}deg)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  const handlePromoClick = (e) => {
    e.preventDefault();
    
    if (!user) {
      showToast("Para aprovechar la promoción, primero debes solicitar acceso al club.", "warning");
      setTimeout(() => window.location.href = '/login', 2500);
      return;
    }

    if (user.primerCompraRealizada) {
      showToast("Ya no eres viajero nuevo. ¡Ve al catálogo normal!", "info");
      setTimeout(() => window.location.href = '/comestibles', 2000);
      return;
    }

    showToast("¡Eres elegible! Recuerda añadir 2 productos al carrito para aplicar el 2x1.", "success");
    setTimeout(() => window.location.href = '/comestibles?promo=2x1', 2500);
  };

  // Lógica del contador para la promo (10 PM + 4 horas)
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, active: false });
  
  useEffect(() => {
    const calculateTime = () => {
      // Si el modo es MANUAL, la promo está activa siempre que esté habilitada
      if (promoConfig?.promoMode === 'MANUAL') {
        return { h: 0, m: 0, s: 0, active: true };
      }

      const now = new Date();
      // Usar hora configurada o defecto 22:00
      const startStr = promoConfig?.promoStartTime || '22:00';
      const [startH, startM] = startStr.split(':').map(Number);
      
      const target = new Date();
      target.setHours(startH || 22, startM || 0, 0, 0);
      
      let diff = target - now;
      
      if (diff <= 0) {
        // La promo está ACTIVA por N horas desde el inicio
        const duration = promoConfig?.promoDuration || 4;
        const endPromo = new Date(target);
        endPromo.setHours(target.getHours() + duration);
        const diffEnd = endPromo - now;
        
        if (diffEnd > 0) {
          return { h: 0, m: 0, s: 0, active: true };
        }
        target.setDate(target.getDate() + 1);
        diff = target - now;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return { h, m, s, active: false };
    };

    const timer = setInterval(() => {
      if (promoConfig) setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [promoConfig]);

  return (
    <div className="home">
      {/* Banner de Promo Lanzamiento */}
      <div className={`promo-banner ${timeLeft.active ? 'active' : ''}`} style={{ 
        background: 'linear-gradient(90deg, #000000 0%, #111111 50%, #000000 100%)', 
        color: 'white', 
        padding: '0.6rem 1rem', 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        position: 'sticky',
        top: window.innerWidth > 768 ? '114px' : '90px', // Debajo del Navbar y TopBanner
        zIndex: 900,

        boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(251, 192, 45, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
          {timeLeft.active ? (
            <>
              <Zap size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>{promoConfig?.promo2x1Titulo || 'PROMO 2X1 ACTIVADA'}</span>
            </>
          ) : (
            <>
              <Clock size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>Próxima Promo en:</span>
            </>
          )}
        </div>
        
        {!timeLeft.active && (
          <div style={{ 
            display: 'flex', 
            gap: '0.4rem', 
            fontFamily: 'monospace', 
            fontSize: '1.2rem', 
            fontWeight: '900',
            background: '#000000',
            padding: '0.3rem 0.8rem',
            borderRadius: '12px',
            border: '2px solid rgba(251, 192, 45, 0.6)',
            color: 'var(--color-secondary)',
            boxShadow: '0 0 15px rgba(0,0,0,0.8), inset 0 0 5px rgba(251, 192, 45, 0.2)'
          }}>
            <span style={{ minWidth: '1.5rem' }}>{String(timeLeft.h).padStart(2, '0')}</span>
            <span style={{ opacity: 0.5 }}>:</span>
            <span style={{ minWidth: '1.5rem' }}>{String(timeLeft.m).padStart(2, '0')}</span>
            <span style={{ opacity: 0.5 }}>:</span>
            <span style={{ minWidth: '1.5rem' }}>{String(timeLeft.s).padStart(2, '0')}</span>
          </div>
        )}

        <button 
          onClick={handlePromoClick} 
          disabled={!timeLeft.active}
          style={{ 
            background: timeLeft.active ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)', 
            color: timeLeft.active ? 'var(--color-primary-dark)' : 'rgba(255,255,255,0.5)', 
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '900',
            cursor: timeLeft.active ? 'pointer' : 'not-allowed',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: timeLeft.active ? '0 0 20px rgba(251, 192, 45, 0.5)' : 'none',
            transform: timeLeft.active ? 'scale(1)' : 'scale(0.95)'
          }}
        >
          {timeLeft.active ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} fill="currentColor" />
              <span>Aprovechar Promo</span>
            </div>
          ) : (
            `Promo en ${String(timeLeft.h).padStart(2, '0')}:${String(timeLeft.m).padStart(2, '0')}:${String(timeLeft.s).padStart(2, '0')}`
          )}
        </button>
      </div>
      {/* Hero Section */}
      <section className="hero" ref={heroRef} data-reveal>
        <div className="container hero__container">
          <div className="hero__content">
            <div className="slogan-badge" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(0,0,0,0.4)', 
              border: '1px solid rgba(255,215,0,0.3)', 
              color: '#fff', 
              padding: '0.5rem 1.2rem', 
              borderRadius: '50px', 
              fontWeight: '600', 
              fontSize: '0.85rem', 
              marginBottom: '2rem', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <Sparkles size={16} color="var(--color-secondary)" />
              <span>NO vendemos drogas, vendemos <span style={{color: 'var(--color-secondary)', fontWeight: '800'}}>postres</span></span>
            </div>
            {authLoading ? (
              <>
                <h1 className="hero__title">
                  Cargando tu <span className="text-secondary">Club</span>...
                </h1>
                <p className="hero__subtitle">
                  Estamos preparando tu panel y beneficios.
                </p>
              </>
            ) : user ? (
              <>
                <h1
                  className="hero__title"
                  data-typewriter-prefix="Bienvenido al "
                  data-typewriter-highlight="Club"
                  data-typewriter-suffix={`, ${user.displayName || 'Viajero'}.`}
                >
                  Bienvenido al <span className="text-secondary">Club</span>, {user.displayName || 'Viajero'}.
                </h1>
                <p className="hero__subtitle">
                  Aqui estan tus beneficios, recompensas y pedidos. Usa los botones para ir directo a lo que necesitas.
                </p>
                <div className="hero__benefits">
                  <div className="hero__benefit">
                    <Sparkles size={16} color="var(--color-secondary)" />
                    <span>Beneficios y promos activas para socios.</span>
                  </div>
                  <div className="hero__benefit">
                    <Star size={16} color="var(--color-secondary)" />
                    <span>Puntos de vuelo y recompensas acumuladas.</span>
                  </div>
                  <div className="hero__benefit">
                    <ShoppingBag size={16} color="var(--color-secondary)" />
                    <span>Acceso al catalogo premium y seguimiento de pedidos.</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1
                  className="hero__title"
                  data-typewriter-prefix="Siente el "
                  data-typewriter-highlight="Viaje"
                  data-typewriter-suffix=". Disfruta el Sabor."
                >
                  Siente el <span className="text-secondary">Viaje</span>. Disfruta el Sabor.
                </h1>
                <p className="hero__subtitle">
                  Brownies cannabicos premium hechos con los mejores ingredientes y la dosis perfecta para una experiencia inigualable, totalmente controlada y segura.
                </p>
              </>
            )}
            <div className="hero__actions" data-reveal>
              {authLoading ? null : user ? (
                <div className="hero__actions-group">
                  <Link to="/comestibles" className="btn btn--primary hero__btn" data-magnetic="true" data-magnetic-strength="0.2">
                    <ShoppingBag size={20} /> Ir al Catálogo
                  </Link>
                  <Link to="/perfil" className="btn btn--secondary hero__btn" data-magnetic="true" data-magnetic-strength="0.14">
                    Mis Beneficios
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn--primary hero__btn hero__btn--pulse" data-magnetic="true" data-magnetic-strength="0.2">
                    <ShieldCheck size={24} /> Solicitar Acceso al Club
                  </Link>
                  <div className="hero__secondary-actions">
                    <Link to="/comestibles" className="btn btn--secondary hero__btn" style={{ flex: 1 }}>
                      Catálogo Clásico
                    </Link>
                    <Link to="/quienes-somos" className="btn btn--primary hero__btn hero__btn--outline" data-magnetic="true" data-magnetic-strength="0.14">
                      Conócenos
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
            <div className="hero__image-wrapper hero__image-wrapper--tilt" data-reveal onMouseMove={handleTilt} onMouseLeave={resetTilt}>
              <img 
                ref={mascotRef}
                src="/mascota-nobg.png" 
                alt="Mascota Brownie Malviaja2" 
                className="hero__image bounce-animation"
              />
            <div ref={blobRef} className="hero__blob"></div>
          </div>
        </div>
      </section>

      {/* Club News Section (logged-in users) o Exclusivity (guests) */}
      {user ? (
        <section className="member-hub">
          <div className="member-hub__glow"></div>
          <div className="container member-hub__container">
            <div className="member-hub__header">
              <div>
                <span className="member-hub__eyebrow">Panel de socios</span>
                <h2>Todo tu viaje en un solo lugar</h2>
                <p>Administra beneficios, pedidos y recompensas sin salir del club.</p>
              </div>
              <Link to="/perfil" className="member-hub__cta">
                Ir a Beneficios <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="member-hub__grid">
              <div className="member-card member-card--status">
                <div className="member-card__title">
                  <Crown size={20} /> Estado del Club
                </div>
                <div className="member-card__metric">
                  <span className="member-card__value">{puntos.toLocaleString()}</span>
                  <span className="member-card__label">Puntos de vuelo</span>
                </div>
                <div className="member-card__tier">
                  <span className="member-card__tier-label">Nivel {currentTier.label}</span>
                  <div className="member-card__progress">
                    <div className="member-card__progress-fill" style={{ width: `${progressToNext}%` }}></div>
                  </div>
                  <span className="member-card__tier-next">
                    {nextTier ? `Faltan ${Math.max(0, nextTier.min - puntos).toLocaleString()} pts para ${nextTier.label}` : 'Nivel maximo alcanzado'}
                  </span>
                </div>
                <div className="member-card__row">
                  <span>Racha activa</span>
                  <strong>{rachaDias || 0} dias</strong>
                </div>
                <div className="member-card__row">
                  <span>Pedidos totales</span>
                  <strong>{totalPedidos || recentPedidos.length || 0}</strong>
                </div>
              </div>

              <div className="member-card member-card--actions">
                <div className="member-card__title">
                  <BadgeCheck size={20} /> Accesos rapidos
                </div>
                <div className="member-card__actions">
                  <Link to="/comestibles" className="member-card__action">
                    <ShoppingBag size={18} /> Catalogo premium
                  </Link>
                  <Link to="/perfil" className="member-card__action">
                    <Star size={18} /> Mis recompensas
                  </Link>
                  <Link to="/mis-pedidos" className="member-card__action">
                    <Package size={18} /> Mis pedidos
                  </Link>
                  <Link to="/perfil" className="member-card__action">
                    <Users size={18} /> Invitar amigos
                  </Link>
                </div>
                <div className="member-card__note">Todo lo de tu cuenta en un solo flujo.</div>
              </div>



              <div className="member-card member-card--orders">
                <div className="member-card__title">
                  <Package size={20} /> Ultimos pedidos
                </div>
                {loadingPedidos ? (
                  <p className="member-card__muted">Cargando pedidos...</p>
                ) : recentPedidos.length === 0 ? (
                  <p className="member-card__muted">Aun no tienes pedidos. Empieza tu viaje hoy.</p>
                ) : (
                  <div className="member-card__list">
                    {recentPedidos.map((pedido, idx) => (
                      <div key={pedido?.id ?? `pedido-${idx}`} className="member-card__item">
                        <div>
                          <strong>{pedido?.referencia || `Pedido #${pedido?.id || ''}`}</strong>
                          <span>{pedido?.estado || 'En proceso'}</span>
                        </div>
                        <div className="member-card__amount">${Number(pedido?.total || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/perfil" className="member-card__link">Ver historial completo</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="exclusivity__section" style={{ 
          background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)', 
          color: '#fff', 
          textAlign: 'center', 
          borderTop: '1px solid rgba(255,215,0,0.2)',
          borderBottom: '1px solid rgba(255,215,0,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--color-secondary)', filter: 'blur(150px)', opacity: '0.15' }}></div>
          <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: '0.15' }}></div>

          <div className="container" style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', marginBottom: '1.5rem' }}>
              <Lock size={40} color="var(--color-secondary)" />
            </div>
            <h2 className="exclusivity__title" style={{ marginBottom: '1rem', color: '#fff', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Acceso <span style={{ color: 'var(--color-secondary)' }}>Privado</span>
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem', color: '#b0b0b0', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
              Malviaja2 no es para todos. Somos un club confidencial y estrictamente reservado. 
              Actualmente nuestro aforo está limitado a un <strong>máximo de 50 socios activos</strong>.
            </p>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '3.5rem' }}>
              <div data-tilt data-reveal style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Percent size={24} color="var(--color-secondary)" />
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Beneficio de Ingreso</h4>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.6' }}>Obtén un 20% de descuento automático en tu primera orden como bienvenida al club.</p>
              </div>
              
              <div data-tilt data-reveal style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Timer size={24} color="#ff5252" />
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Mantenimiento de Cupo</h4>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.6' }}>Para conservar tu membresía, requerimos un pedido mínimo de $15.000 COP cada 15 días.</p>
              </div>
            </div>
            
            <Link to="/login" className="btn btn--secondary" data-magnetic="true" data-magnetic-strength="0.18" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 10px 25px rgba(255,215,0,0.2)', borderRadius: '50px' }}>
              Verificar Disponibilidad
            </Link>
          </div>
        </section>
      )}

      {/* Sección Promocional Dedicada */}
      {promoConfig?.promo2x1Enabled && (
        <section className="active-promo" style={{
          background: 'linear-gradient(135deg, rgba(251, 192, 45, 0.1) 0%, rgba(251, 192, 45, 0.02) 100%)',
          borderTop: '1px solid rgba(251, 192, 45, 0.3)',
          borderBottom: '1px solid rgba(251, 192, 45, 0.3)',
          padding: '4rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '0', right: '0', width: '300px', height: '300px', background: 'var(--color-secondary)', filter: 'blur(150px)', opacity: '0.1' }}></div>
          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {user?.primerCompraRealizada ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(76, 175, 80, 0.15)', border: '1px solid #4caf50', color: '#4caf50', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} /> ¡Beneficio de bienvenida usado!
                </div>
                
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
                  Ya eres parte del Club
                </h2>
                
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                  Ya has aprovechado tu beneficio de primera compra. Sigue disfrutando de nuestro catálogo regular y acumula puntos en cada pedido.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => window.location.href = '/comestibles'} className="btn btn--secondary" data-magnetic="true" data-magnetic-strength="0.15" style={{
                    padding: '1.2rem 3.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    boxShadow: '0 8px 25px rgba(251, 192, 45, 0.4)',
                    borderRadius: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: 'none'
                  }}>
                    <ShoppingBag size={22} /> Ir al Catálogo Regular
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251, 192, 45, 0.15)', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                  <Gift size={18} /> ¡Promo Activa por Tiempo Limitado!
                </div>
                
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
                  {promoConfig.promo2x1Titulo || 'Lanzamiento 2x1 en Todo el Catálogo'}
                </h2>
                
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                  {promoConfig.promo2x1Subtitulo || 'Aprovecha nuestra promo exclusiva. Válido solo para usuarios seleccionados que realicen su compra a través de la web.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                  <button onClick={handlePromoClick} className="btn btn--secondary" data-magnetic="true" data-magnetic-strength="0.15" style={{
                    padding: '1.2rem 3.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    boxShadow: '0 8px 25px rgba(251, 192, 45, 0.4)',
                    borderRadius: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: 'none'
                  }}>
                    <ShoppingBag size={22} /> Reserva tu Combo 2x1
                  </button>
                  
                  <div style={{ fontSize: '0.9rem', color: '#b0b0b0', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Gift size={16} color="var(--color-secondary)" /> <span>¡Paga <strong>1 y recibe 2 brownies</strong> de la referencia seleccionada!</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Timer size={14} color="#ff5252" />
                    <span>La promo se cierra al llegar a los {promoConfig.promo2x1MaxUsuarios || 20} cupos habilitados.</span>
                  </div>
                  
                  {promoConfig.promo2x1GroupLink && (
                    <a href={promoConfig.promo2x1GroupLink} target="_blank" rel="noreferrer" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: '600' }}>
                      Unirse al grupo de WhatsApp oficial
                    </a>
                  )}

                  {/* Términos y Condiciones de la Promo */}
                  {promoConfig.promo2x1Terminos && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '520px', width: '100%', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#b0b0b0', fontWeight: 'bold', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FileText size={12} /> Términos y Condiciones
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#999', lineHeight: 1.55 }}>
                        {promoConfig.promo2x1Terminos.split('\n').filter(t => t.trim()).map((term, i) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{term}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Product Highlight Section */}
      <section className="product-highlight" style={{ background: 'var(--color-surface)', padding: '5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title text-primary-dark" style={{ marginBottom: '1rem', fontSize: '2.5rem', fontWeight: '900' }}>
              La Experiencia Perfecta en un Bocado
            </h2>
            <p className="text-light" style={{ fontSize: '1.1rem', marginBottom: '3rem', color: 'var(--color-text-light)', lineHeight: '1.6' }}>
              Nuestros comestibles están diseñados para brindarte un efecto limpio y prolongado, sin complicaciones. Solo disfruta.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            <div data-tilt data-reveal style={{ padding: '1.5rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><Zap size={32} /></div>
                <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem' }}>Alta Eficiencia</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Absorción óptima. Siente los primeros efectos entre 45 a 60 minutos con una duración estable y prolongada.</p>
              </div>
            <div data-tilt data-reveal style={{ padding: '1.5rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}><Clock size={32} /></div>
                <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem' }}>Dosis Precisa</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Cada porción contiene la cantidad exacta de miligramos para que controles tu experiencia al 100%.</p>
              </div>
            <div data-tilt data-reveal style={{ padding: '1.5rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-primary-light)', marginBottom: '1rem' }}><ShieldCheck size={32} /></div>
                <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem' }}>Discreción Total</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Disfruta donde quieras. Sin humo, sin olores delatores y con el aspecto de un postre gourmet.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-16">
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '3rem' }}>¿Por qué elegir Malviaja2?</h2>
          <div className="features__grid">
            <div className="feature-card glass" data-tilt data-reveal style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: 'var(--color-primary-light)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Star size={32} />
              </div>
              <h3 className="feature-card__title" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Ingredientes Premium</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>
                Nuestra receta artesanal utiliza exclusivamente chocolate belga al 70% cacao y mantequilla infundida de la más alta pureza para una textura perfecta.
              </p>
            </div>
            <div className="feature-card glass" data-tilt data-reveal style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: '#fff59d', color: 'var(--color-secondary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Target size={32} />
              </div>
              <h3 className="feature-card__title" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Dosis Exactas</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>
                Olvídate de las malas experiencias. Cada brownie pasa por un control estricto para garantizar que la dosis sea idéntica, predecible y segura en cada bocado.
              </p>
            </div>
            <div className="feature-card glass" data-tilt data-reveal style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: '#efebe9', color: 'var(--color-primary-dark)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Sparkles size={32} />
              </div>
              <h3 className="feature-card__title" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Sabor Increíble</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>
                Hemos logrado enmascarar el amargor herbal mediante técnicas de pastelería avanzadas. Disfrutarás de un postre gourmet con un toque mágico.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Toast Notification */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: toast.show ? 'translate(-50%, 0)' : 'translate(-50%, 150%)',
        opacity: toast.show ? 1 : 0,
        background: toast.type === 'warning' ? '#ff9800' : toast.type === 'success' ? '#4caf50' : 'var(--color-primary-dark)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '50px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 9999,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        pointerEvents: toast.show ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}>
        <Info size={20} color="white" />
        <span style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}>{toast.message}</span>
      </div>
    </div>
  );
};

export default Home;
