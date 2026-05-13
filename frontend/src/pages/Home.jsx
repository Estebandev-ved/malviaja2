import { Link } from 'react-router-dom';
import { Star, Target, Sparkles, FlaskConical, Clock, ShieldCheck, Zap, Lock, Percent, Timer, Megaphone, Trophy, Gift, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useStore from '../store/useStore';
import './Home.css';

const NOTICIAS_STORAGE_KEY = 'admin_noticias';

const TIPO_ICONOS = {
  sorteo: { icon: Trophy, color: '#ff9800', label: '🎟️ Sorteo' },
  descuento: { icon: Gift, color: '#4caf50', label: '🔥 Descuento' },
  nuevo_producto: { icon: ShoppingBag, color: '#2196f3', label: '🍫 Nuevo' },
  general: { icon: Megaphone, color: '#9c27b0', label: '📢 Novedad' },
};

const Home = () => {
  const user = useStore(state => state.user);
  const [noticias, setNoticias] = useState([]);
  const heroRef = useRef(null);
  const mascotRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTICIAS_STORAGE_KEY) || '[]');
      setNoticias(stored.filter(n => n.activo).slice(0, 6));
    } catch {}
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
    const cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;

    const onMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / 10).toFixed(1)}deg) rotateY(${((centerX - x) / 10).toFixed(1)}deg) scale3d(1.02,1.02,1.02)`;
    };

    const onLeave = (e) => {
      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    };
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

  return (
    <div className="home">
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
            <h1
              className="hero__title"
              data-typewriter-prefix="Siente el "
              data-typewriter-highlight="Viaje"
              data-typewriter-suffix=". Disfruta el Sabor."
            >
              Siente el <span className="text-secondary">Viaje</span>. Disfruta el Sabor.
            </h1>
            <p className="hero__subtitle">
              Brownies cannábicos premium hechos con los mejores ingredientes y la dosis perfecta para una experiencia inigualable, totalmente controlada y segura.
            </p>
            <div className="hero__actions" data-reveal>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251,192,45,0.12), rgba(251,192,45,0.04))',
                    border: '1px solid rgba(251,192,45,0.25)',
                    borderRadius: '16px', padding: '1.25rem 1.5rem',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      👑 Bienvenido al Club
                    </div>
                    <div style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: '#fff', fontWeight: 'bold' }}>
                      {user.displayName || 'Miembro'}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '0.4rem 0 0' }}>
                      Explora nuestro catálogo premium y tus beneficios exclusivos.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link to="/comestibles" className="btn btn--primary hero__btn" data-magnetic="true" data-magnetic-strength="0.2" style={{ flex: 1 }}>
                      <ShoppingBag size={20} /> Ir al Catálogo
                    </Link>
                    <Link to="/perfil" className="btn btn--secondary hero__btn" data-magnetic="true" data-magnetic-strength="0.14" style={{ flex: 1 }}>
                      Mis Beneficios
                    </Link>
                  </div>
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
        <section style={{ 
          background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)', 
          color: '#fff', 
          borderTop: '1px solid rgba(255,215,0,0.2)',
          borderBottom: '1px solid rgba(255,215,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
          padding: '5rem 0'
        }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--color-secondary)', filter: 'blur(150px)', opacity: '0.12' }}></div>
          <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: '0.12' }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', marginBottom: '1rem' }}>
                <Megaphone size={36} color="var(--color-secondary)" />
              </div>
              <h2 style={{ color: '#fff', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '0.5rem' }}>
                Novedades del <span style={{ color: 'var(--color-secondary)' }}>Club</span>
              </h2>
              <p style={{ color: '#b0b0b0', fontSize: '1rem' }}>Mantente al día con todo lo que estamos preparando para ti.</p>
            </div>

            {noticias.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Sparkles size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ color: '#666' }}>Pronto tendremos novedades. Vuelve pronto.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {noticias.map(n => {
                  const tipo = TIPO_ICONOS[n.tipo] || TIPO_ICONOS.general;
                  const Icon = tipo.icon;
                  return (
                    <div key={n.id} data-reveal style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <Icon size={20} color={tipo.color} />
                        <span style={{ fontSize: '0.75rem', color: tipo.color, background: `${tipo.color}15`, padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{tipo.label}</span>
                        <span style={{ fontSize: '0.7rem', color: '#666', marginLeft: 'auto' }}>{n.fecha}</span>
                      </div>
                      <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{n.titulo}</h3>
                      {n.descripcion && <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{n.descripcion}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/perfil" className="btn btn--secondary" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', fontWeight: 'bold', borderRadius: '50px' }}>
                Ir a Mi Perfil
              </Link>
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

          <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
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
    </div>
  );
};

export default Home;
