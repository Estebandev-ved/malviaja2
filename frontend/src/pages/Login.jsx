import React, { useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import useStore from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, History, Zap, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  if (user) return null;

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error al iniciar sesión con Google", error);
      alert("Hubo un error al iniciar sesión. Intenta de nuevo.");
    }
  };

  const benefitStyle = { display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-sm)' };
  const iconBox = { padding: '0.65rem', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', background: 'linear-gradient(180deg, #fff8e1 0%, #f5efe0 100%)' }}>
      <div className="container py-16">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto', alignItems: 'center' }}>

          {/* Beneficios */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} className="text-secondary" />
              <h1 className="section-title" style={{ margin: 0, fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' }}>
                Tu Viaje, <span className="text-primary-dark">Seguro</span>
              </h1>
            </div>
            <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', marginBottom: '2rem', color: 'var(--color-text-light)', lineHeight: '1.6' }}>
              Crear una cuenta desbloquea seguimiento premium, historial de pedidos y checkout exprés.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: MapPin, color: 'var(--color-primary-light)', bg: 'white', title: 'Rastreo en Tiempo Real', desc: 'Observa cada etapa de tu pedido desde que lo aceptamos hasta la entrega.' },
                { icon: History, color: '#fbc02d', bg: '#fff59d', title: 'Historial y Repetición', desc: 'Re-ordena tus favoritos con un solo clic desde tu perfil.' },
                { icon: Zap, color: 'var(--color-primary-dark)', bg: '#efebe9', title: 'Checkout Optimizado', desc: 'Tus datos guardados para pagar en segundos.' },
              ].map((b, i) => (
                <div key={i} style={benefitStyle}>
                  <div style={{ ...iconBox, background: b.bg || b.color, color: b.color === 'white' ? b.color : 'white' }}>
                    <b.icon size={20} color={b.color} />
                  </div>
                  <div>
                    <h3 className="text-primary font-bold" style={{ marginBottom: '0.15rem', fontSize: '0.95rem' }}>{b.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2rem)', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-lg)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <h2 className="text-primary-dark font-bold" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '1rem' }}>Acceso al Club</h2>

            <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.85rem', color: '#b71c1c' }}>
              <strong>🔒 Aviso de Confidencialidad:</strong><br />
              Malviaja2 tiene un límite de <strong>50 miembros activos</strong>. Sin pedidos en 15 días, tu cuenta se desactiva.<br /><br />
              🎁 <em>Nuevos registros reciben 20% OFF.</em>
            </div>

            <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform var(--transition-fast)', WebkitTapHighlightColor: 'transparent' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '22px' }} />
              Continuar con Google
            </button>

            <div style={{ margin: '1.5rem 0', color: 'var(--color-text-light)', position: 'relative' }}>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd' }} />
              <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'transparent', padding: '0 10px', fontSize: '0.85rem' }}>o</span>
            </div>

            <p style={{ color: 'var(--color-text-light)', fontSize: '0.82rem' }}>
              Más métodos de registro pronto. Por ahora, usa Google para máxima seguridad.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
