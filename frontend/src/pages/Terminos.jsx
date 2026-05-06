import { AlertTriangle } from 'lucide-react';

const Terminos = () => {
  return (
    <div className="container py-16">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="section-title text-center">Términos y Condiciones</h1>
        
        <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={24} /> IMPORTANTE: El acceso y uso de este sitio web está estrictamente limitado a personas mayores de 18 años.
          </div>

          <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Uso Responsable</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)' }}>
            Los productos ofrecidos en Malviaja2 contienen extractos de cannabis. El usuario asume toda la responsabilidad sobre el consumo de los mismos. Recomendamos fuertemente seguir las indicaciones de dosificación y no mezclar con alcohol u otras sustancias.
          </p>

          <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Envíos y Entregas</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)' }}>
            Los envíos se realizan de manera discreta. El tiempo estimado de entrega es de 24 a 48 horas hábiles dependiendo de la ciudad. No nos hacemos responsables por demoras de terceros (empresas de mensajería).
          </p>

          <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Devoluciones</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)' }}>
            Por tratarse de productos alimenticios perecederos, no se aceptan devoluciones una vez el producto ha sido entregado, salvo en casos donde el empaque original llegue dañado o alterado.
          </p>

          <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Privacidad</h3>
          <p style={{ color: 'var(--color-text-light)' }}>
            Tus datos personales y de envío son tratados con estricta confidencialidad y no serán compartidos con terceros sin tu consentimiento explícito.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terminos;
