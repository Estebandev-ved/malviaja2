import { useState, useEffect } from 'react';
import { Star, MessageSquare, X, Send, User } from 'lucide-react';
import useStore from '../store/useStore';
import { authFetch, apiFetch } from '../api';

const StarSelector = ({ value, onChange, disabled }) => (
  <div style={{ display: 'flex', gap: '0.25rem' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange(star)}
        style={{ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', padding: '2px', color: star <= value ? '#fbc02d' : '#e0e0e0', transition: 'color 0.15s' }}
      >
        <Star size={22} fill={star <= value ? '#fbc02d' : 'none'} />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productoId, productoNombre, onClose }) => {
  const user = useStore(state => state.user);
  const [resenas, setResenas] = useState([]);
  const [resumen, setResumen] = useState({ promedio: 0, total: 0 });
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!productoId) return;
    apiFetch(`/api/productos/${productoId}/resenas`).then(r => r.ok && r.json()).then(d => { if (d) setResenas(d); }).catch(() => {});
    apiFetch(`/api/productos/${productoId}/resenas/resumen`).then(r => r.ok && r.json()).then(d => { if (d) setResumen(d); }).catch(() => {}).finally(() => setCargando(false));
  }, [productoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!calificacion || !comentario.trim()) return;
    setEnviando(true);
    try {
      const res = await authFetch(`/api/productos/${productoId}/resenas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioUid: user.uid,
          usuarioNombre: user.displayName || 'Anónimo',
          calificacion,
          comentario: comentario.trim()
        })
      });
      if (res.ok) {
        const nueva = await res.json();
        setResenas(prev => [nueva, ...prev]);
        setResumen(prev => ({
          promedio: ((prev.promedio * prev.total) + calificacion) / (prev.total + 1),
          total: prev.total + 1
        }));
        setCalificacion(0);
        setComentario('');
      }
    } catch {}
    setEnviando(false);
  };

  const renderStars = (rating) => (
    <div style={{ display: 'inline-flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={14} fill={s <= rating ? '#fbc02d' : 'none'} color={s <= rating ? '#fbc02d' : '#e0e0e0'} />
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '520px',
        width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>Reseñas</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{productoNombre}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0.25rem' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{resumen.promedio.toFixed(1)}</div>
            {renderStars(Math.round(resumen.promedio))}
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>{resumen.total} reseña(s)</div>
          </div>

          {user && (
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <StarSelector value={calificacion} onChange={setCalificacion} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="Tu opinión..." value={comentario} onChange={e => setComentario(e.target.value)} maxLength={500}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }} />
                <button type="submit" disabled={enviando || !calificacion || !comentario.trim()}
                  className="btn btn--primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', opacity: (!calificacion || !comentario.trim()) ? 0.6 : 1 }}>
                  <Send size={14} /> {enviando ? '...' : 'Enviar'}
                </button>
              </div>
            </form>
          )}
          {!user && (
            <p style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>Inicia sesión para dejar una reseña.</p>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.5rem' }}>
          {cargando ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Cargando reseñas...</p>
          ) : resenas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
              <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>Sé el primero en reseñar este producto.</p>
            </div>
          ) : (
            resenas.map(r => (
              <div key={r.id} style={{ padding: '1rem 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} color="#999" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{r.usuarioNombre}</span>
                    <span style={{ fontSize: '0.7rem', color: '#bbb' }}>{r.fecha}</span>
                  </div>
                  {renderStars(r.calificacion)}
                </div>
                {r.comentario && <p style={{ fontSize: '0.9rem', color: '#555', margin: 0, lineHeight: '1.4' }}>{r.comentario}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
