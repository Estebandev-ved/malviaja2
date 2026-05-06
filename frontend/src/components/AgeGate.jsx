import { useState, useEffect } from 'react';
import './AgeGate.css';
import { ShieldAlert } from 'lucide-react';

const AgeGate = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Revisar si ya se verificó antes
    const hasVerified = localStorage.getItem('malviaja2_age_verified');
    if (!hasVerified) {
      setIsVisible(true);
      // Bloquear scroll
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('malviaja2_age_verified', 'true');
    setIsVisible(false);
    document.body.style.overflow = 'auto'; // Restaurar scroll
  };

  const handleReject = () => {
    setError(true);
  };

  if (!isVisible) return null;

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal glass-dark">
        <div className="age-gate-logo-container">
          <img src="/mascota-nobg.png" alt="Malviaja2 Logo" className="age-gate-logo levitate-slow" />
        </div>
        
        <div className="age-gate-content">
          <ShieldAlert size={48} className="text-secondary" style={{ margin: '0 auto 1rem' }} />
          <h1 className="age-gate-title text-primary-dark">Verificación de Edad</h1>
          <p className="age-gate-text">
            Este sitio web contiene productos e información relacionada con el cannabis, destinados exclusivamente a adultos.
          </p>
          <p className="age-gate-text font-bold" style={{ color: 'var(--color-primary-dark)', fontSize: '1.2rem', margin: '1.5rem 0' }}>
            ¿Eres mayor de 18 años?
          </p>

          {error && (
            <div className="age-gate-error">
              Lo sentimos, debes ser mayor de edad para acceder a esta plataforma por regulaciones legales.
            </div>
          )}

          <div className="age-gate-actions">
            <button className="btn btn--primary age-btn" onClick={handleAccept}>
              Sí, soy mayor de 18 años
            </button>
            <button className="btn age-btn-reject" onClick={handleReject}>
              No, soy menor
            </button>
          </div>
          
          <div className="age-gate-footer">
            Al entrar, confirmas tu mayoría de edad y aceptas nuestros Términos y Condiciones.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeGate;
