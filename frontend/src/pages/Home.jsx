import { Link } from 'react-router-dom';
import { Star, Target, Sparkles, FlaskConical, Clock, ShieldCheck, Zap, Lock, Percent, Timer } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
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
            <h1 className="hero__title">
              Siente el <span className="text-secondary">Viaje</span>. Disfruta el Sabor.
            </h1>
            <p className="hero__subtitle">
              Brownies cannábicos premium hechos con los mejores ingredientes y la dosis perfecta para una experiencia inigualable, totalmente controlada y segura.
            </p>
            <div className="hero__actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
              <Link to="/login" className="btn btn--primary hero__btn" style={{ fontSize: '1.2rem', padding: '1.25rem', background: 'var(--color-primary-dark)', boxShadow: '0 0 20px rgba(93,64,55,0.4)', animation: 'pulse 2s infinite', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <ShieldCheck size={24} /> Solicitar Acceso al Club
              </Link>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/comestibles" className="btn btn--secondary hero__btn" style={{ flex: 1 }}>
                  Catálogo Clásico
                </Link>
                <Link to="/quienes-somos" className="btn btn--primary hero__btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}>
                  Conócenos
                </Link>
              </div>
            </div>
          </div>
          <div className="hero__image-wrapper">
            <img 
              src="/mascota-nobg.png" 
              alt="Mascota Brownie Malviaja2" 
              className="hero__image bounce-animation"
            />
            <div className="hero__blob"></div>
          </div>
        </div>
      </section>

      {/* Exclusivity / FOMO Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)', 
        color: '#fff', 
        padding: '5rem 0', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,215,0,0.2)',
        borderBottom: '1px solid rgba(255,215,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--color-secondary)', filter: 'blur(150px)', opacity: '0.15' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: '0.15' }}></div>

        <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', marginBottom: '1.5rem' }}>
            <Lock size={40} color="var(--color-secondary)" />
          </div>
          <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem', color: '#fff', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Acceso <span style={{ color: 'var(--color-secondary)' }}>Privado</span>
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3rem', color: '#b0b0b0', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Malviaja2 no es para todos. Somos un club confidencial y estrictamente reservado. 
            Actualmente nuestro aforo está limitado a un <strong>máximo de 50 socios activos</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left', marginBottom: '3.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Percent size={24} color="var(--color-secondary)" />
                <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Beneficio de Ingreso</h4>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.6' }}>Obtén un 20% de descuento automático en tu primera orden como bienvenida al club.</p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Timer size={24} color="#ff5252" />
                <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Mantenimiento de Cupo</h4>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.6' }}>Para conservar tu membresía, requerimos un pedido mínimo de $15.000 COP cada 15 días.</p>
            </div>
          </div>
          
          <Link to="/login" className="btn btn--secondary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 10px 25px rgba(255,215,0,0.2)', borderRadius: '50px' }}>
            Verificar Disponibilidad
          </Link>
        </div>
      </section>

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
              <div style={{ padding: '1.5rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><Zap size={32} /></div>
                <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem' }}>Alta Eficiencia</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Absorción óptima. Siente los primeros efectos entre 45 a 60 minutos con una duración estable y prolongada.</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}><Clock size={32} /></div>
                <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem' }}>Dosis Precisa</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Cada porción contiene la cantidad exacta de miligramos para que controles tu experiencia al 100%.</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
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
            <div className="feature-card glass" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: 'var(--color-primary-light)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Star size={32} />
              </div>
              <h3 className="feature-card__title" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Ingredientes Premium</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>
                Nuestra receta artesanal utiliza exclusivamente chocolate belga al 70% cacao y mantequilla infundida de la más alta pureza para una textura perfecta.
              </p>
            </div>
            <div className="feature-card glass" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ background: '#fff59d', color: 'var(--color-secondary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Target size={32} />
              </div>
              <h3 className="feature-card__title" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Dosis Exactas</h3>
              <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>
                Olvídate de las malas experiencias. Cada brownie pasa por un control estricto para garantizar que la dosis sea idéntica, predecible y segura en cada bocado.
              </p>
            </div>
            <div className="feature-card glass" style={{ textAlign: 'center', padding: '2rem' }}>
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
