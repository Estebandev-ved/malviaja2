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
    if (user) {
      navigate(from, { replace: true });
    }
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

  return (
    <div className="container py-16" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', maxWidth: '1200px', margin: '0 auto', alignItems: 'center' }}>
        
        {/* Lado Izquierdo: Beneficios detallados pero limpios */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={32} className="text-secondary" />
            <h1 className="section-title" style={{ margin: 0, fontSize: '2.5rem' }}>
              Tu Viaje, <span className="text-primary-dark">Seguro</span>
            </h1>
          </div>
          <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: 'var(--color-text-light)', lineHeight: '1.6' }}>
            Crear una cuenta en Malviaja2 no solo asegura tu compra, sino que desbloquea una experiencia de seguimiento premium diseñada para tu tranquilidad.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '50%', color: 'white', flexShrink: 0 }}>
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-primary font-bold" style={{ marginBottom: '0.25rem' }}>Rastreo en Tiempo Real</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: 0 }}>
                  Observa exactamente en qué estado se encuentra tu pedido: desde que lo aceptamos hasta que el repartidor está en camino hacia tu puerta.
                </p>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--color-secondary)' }}>
              <div style={{ background: '#fff59d', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-secondary)', flexShrink: 0 }}>
                <History size={24} />
              </div>
              <div>
                <h3 className="text-primary font-bold" style={{ marginBottom: '0.25rem' }}>Historial y Repetición</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: 0 }}>
                  ¿Te encantó tu último viaje? Accede a tu perfil para ver todas tus compras anteriores y re-ordena tus favoritos con un solo clic.
                </p>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', borderLeft: '4px solid var(--color-primary-dark)' }}>
              <div style={{ background: '#efebe9', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary-dark)', flexShrink: 0 }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-primary font-bold" style={{ marginBottom: '0.25rem' }}>Checkout Optimizado</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', margin: 0 }}>
                  Olvídate de llenar formularios tediosos cada vez. Guardamos tus datos de envío de forma segura para que pagues en segundos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Login Form */}
        <div className="glass" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="text-primary-dark font-bold" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Acceso al Club</h2>
          
          <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#b71c1c' }}>
              <strong>🔒 Aviso de Confidencialidad:</strong><br/>
              Malviaja2 tiene un límite estricto de <strong>50 miembros activos</strong>. Si no pides en 15 días, tu cuenta será desactivada para ceder el cupo. <br/><br/>
              🎁 <em>Nuevos registros reciben 20% OFF en su primer viaje.</em>
            </p>
          </div>
          
          <button 
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '24px' }} />
            Continuar con Google
          </button>

          <div style={{ margin: '2rem 0', color: 'var(--color-text-light)', position: 'relative' }}>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd' }} />
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#fff8e1', padding: '0 10px', fontSize: '0.9rem' }}>o</span>
          </div>

          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
            El registro con correo y contraseña estará disponible pronto. Por ahora, usa tu cuenta de Google para una experiencia más segura y rápida.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
