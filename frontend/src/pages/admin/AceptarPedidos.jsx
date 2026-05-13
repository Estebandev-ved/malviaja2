import { useEffect, useMemo, useState, useRef } from 'react';
import { CheckCircle2, Clock, RefreshCw, Truck, XCircle, Package, Search, ZoomIn, X, CreditCard, ExternalLink, User, MapPin, DollarSign, ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';
import { authFetch } from '../../api';

const ESTADO_META = {
  PENDIENTE: { label: 'Pendiente', color: '#e65100', bg: '#fff3e0', icon: Clock },
  PAGADO: { label: 'Pagado', color: '#1b5e20', bg: '#e8f5e9', icon: CheckCircle2 },
  REVISION_MANUAL: { label: 'Revisión Manual', color: '#6a1b9a', bg: '#f3e5f5', icon: Clock },
  PREPARANDO: { label: 'Preparando', color: '#f57f17', bg: '#fff9c4', icon: Package },
  EN_CAMINO: { label: 'En Camino', color: '#2e7d32', bg: '#e8f5e9', icon: Truck },
  ENTREGADO: { label: 'Entregado', color: '#1b5e20', bg: '#c8e6c9', icon: CheckCircle2 },
  CANCELADO: { label: 'Cancelado', color: '#c62828', bg: '#ffebee', icon: XCircle },
};

const KANBAN_COLUMNS = [
  { key: 'PENDIENTE', label: 'Pendientes', color: '#ff9800', estados: ['PENDIENTE'] },
  { key: 'VERIFICANDO', label: 'Verificando', color: '#2196f3', estados: ['PAGADO', 'REVISION_MANUAL'] },
  { key: 'APROBADO', label: 'Aprobados', color: '#4caf50', estados: ['PREPARANDO', 'EN_CAMINO', 'ENTREGADO'] },
];

const Lightbox = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', zIndex: 100 }} onClick={onClose}>
      <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
        <X size={24} />
      </button>
      <img src={src} alt={alt || 'Comprobante'} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 'var(--radius-md)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', objectFit: 'contain' }} />
    </div>
  );
};

const PedidoCard = ({ pedido, onStatusChange, onVerClick, isUpdating }) => {
  const meta = ESTADO_META[pedido.estado] || ESTADO_META.PENDIENTE;
  const Icon = meta.icon;
  const nextStates = {
    PENDIENTE: 'PAGADO',
    PAGADO: 'PREPARANDO',
    REVISION_MANUAL: 'PREPARANDO',
    PREPARANDO: 'EN_CAMINO',
    EN_CAMINO: 'ENTREGADO',
  };
  const nextState = nextStates[pedido.estado];
  const isTerminal = ['ENTREGADO', 'CANCELADO'].includes(pedido.estado);

  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: isUpdating ? '0 0 0 2px var(--color-secondary)' : 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.2s', opacity: isUpdating ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>#{pedido.id}</span>
          {pedido.referenciaPago && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginLeft: '0.5rem', fontFamily: 'monospace' }}>{pedido.referenciaPago}</span>}
        </div>
        <span style={{ fontSize: '0.72rem', background: meta.bg, color: meta.color, padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Icon size={12} /> {meta.label}
        </span>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
        <User size={12} style={{ marginRight: '0.3rem', opacity: 0.5 }} /> {pedido.nombreReceptor || 'Sin nombre'}
      </div>
      {pedido.direccionEnvio && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <MapPin size={12} style={{ marginRight: '0.3rem', opacity: 0.5 }} /> {pedido.direccionEnvio}
        </div>
      )}
      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
        <DollarSign size={14} style={{ marginRight: '0.2rem' }} />${(pedido.total || 0).toLocaleString('es-CO')}
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {pedido.ocrJson && pedido.ocrJson.startsWith('{') && (
          <button onClick={() => onVerClick(pedido)} style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ZoomIn size={14} /> OCR
          </button>
        )}
        {!isTerminal && nextState && (
          <button onClick={() => onStatusChange(pedido.id, nextState)} disabled={isUpdating} style={{ border: 'none', background: meta.color, color: 'white', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {nextState === 'PREPARANDO' ? '✅ Aprobar' : nextState === 'EN_CAMINO' ? '🚴 Enviar' : nextState === 'ENTREGADO' ? '📦 Entregar' : 'Avanzar'} <ArrowRight size={14} />
          </button>
        )}
        {pedido.estado === 'PENDIENTE' && (
          <button onClick={() => onStatusChange(pedido.id, 'CANCELADO')} disabled={isUpdating} style={{ border: '1px solid #f44336', background: '#fff5f5', color: '#c62828', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
            Rechazar
          </button>
        )}
      </div>
    </div>
  );
};

const OCRModal = ({ pedido, onClose }) => {
  if (!pedido) return null;
  let ocrData = null;
  try { if (pedido.ocrJson && pedido.ocrJson.startsWith('{')) ocrData = JSON.parse(pedido.ocrJson); } catch {}

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>OCR - Pedido #{pedido.id}</h3>
        {ocrData ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div><strong>Entidad:</strong> {ocrData.entidad || 'N/A'}</div>
            <div><strong>Monto:</strong> ${ocrData.monto?.toLocaleString('es-CO') || 'N/A'}</div>
            <div><strong>Referencia:</strong> {ocrData.referencia || 'N/A'}</div>
            <div><strong>Fecha:</strong> {ocrData.fecha || 'N/A'}</div>
            <div><strong>Confianza:</strong> {ocrData.confianza_extraccion ? `${Math.round(ocrData.confianza_extraccion * 100)}%` : 'N/A'}</div>
            {ocrData.raw_text && <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'monospace', maxHeight: '150px', overflowY: 'auto' }}>{ocrData.raw_text}</div>}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-light)' }}>No hay datos OCR disponibles para este pedido.</p>
        )}
        <button className="btn btn--primary w-full" style={{ marginTop: '1rem' }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

const AceptarPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchRef, setSearchRef] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [ocrPedido, setOcrPedido] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/pedidos/todos');
      if (res.ok) {
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : data?.content || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const actualizarEstado = async (pedidoId, estado) => {
    setUpdating(pedidoId);
    try {
      const res = await authFetch(`/api/pedidos/${pedidoId}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        const actualizado = await res.json();
        setPedidos(prev => prev.map(p => (p.id === pedidoId ? actualizado : p)));
      }
    } catch (_) {}
    setUpdating(null);
  };

  const filtered = useMemo(() => {
    if (!searchRef.trim()) return pedidos;
    const q = searchRef.trim().toLowerCase();
    return pedidos.filter(p =>
      String(p.id).includes(q) ||
      (p.referenciaPago || '').toLowerCase().includes(q) ||
      (p.nombreReceptor || '').toLowerCase().includes(q)
    );
  }, [pedidos, searchRef]);

  const getColumnPedidos = (estados) => filtered.filter(p => estados.includes(p.estado));
  const pendientesCount = pedidos.filter(p => p.estado === 'PENDIENTE').length;

  if (viewMode === 'kanban') return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 className="section-title" style={{ fontSize: '1.6rem', margin: 0 }}>✅ Cola de Verificación</h1>
          {pendientesCount > 0 && (
            <span style={{ background: '#ff9800', color: 'white', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input type="text" placeholder="Buscar por ID, ref o nombre..." value={searchRef} onChange={e => setSearchRef(e.target.value)} style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '999px', border: '1px solid #ddd', fontSize: '0.85rem', width: '200px' }} />
          </div>
          <button onClick={fetchPedidos} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', minHeight: '60vh' }}>
        {KANBAN_COLUMNS.map(col => {
          const colPedidos = getColumnPedidos(col.estados);
          return (
            <div key={col.key} style={{ background: '#f8f9fa', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: `2px solid ${col.color}` }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>{col.label}</span>
                <span style={{ background: col.color + '20', color: col.color, padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{colPedidos.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div className="skeleton-block" style={{ height: '14px', width: '60%', marginBottom: '0.5rem' }} />
                      <div className="skeleton-block" style={{ height: '12px', width: '40%' }} />
                    </div>
                  ))
                ) : colPedidos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                    No hay pedidos en esta columna
                  </div>
                ) : (
                  colPedidos.map(p => (
                    <PedidoCard key={p.id} pedido={p} onStatusChange={actualizarEstado} onVerClick={(ped) => setOcrPedido(ped)} isUpdating={updating === p.id} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button onClick={() => setViewMode('table')} style={{ border: '1px solid #ddd', background: 'white', padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Ver como tabla
        </button>
      </div>

      {ocrPedido && <OCRModal pedido={ocrPedido} onClose={() => setOcrPedido(null)} />}
      {lightboxSrc && <Lightbox src={lightboxSrc} alt="Comprobante" onClose={() => setLightboxSrc(null)} />}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.6rem', margin: 0 }}>✅ Aceptar Pedidos</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setViewMode('kanban')} style={{ border: '1px solid #ddd', background: 'white', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Kanban</button>
          <button onClick={fetchPedidos} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>{loading ? 'Cargando...' : 'Sin resultados'}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f4f6f8' }}>
                  {['ID', 'Ref', 'Cliente', 'Dirección', 'Total', 'Estado', 'OCR'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(p => {
                  const meta = ESTADO_META[p.estado] || ESTADO_META.PENDIENTE;
                  const Icon = meta.icon;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.referenciaPago || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.nombreReceptor || 'Sin nombre'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccionEnvio || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>${(p.total || 0).toLocaleString('es-CO')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: meta.bg, color: meta.color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Icon size={14} /> {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {(() => {
                          if (!p.ocrJson || !p.ocrJson.startsWith('{')) return <span style={{ color: '#999', fontSize: '0.85rem' }}>Sin OCR</span>;
                          try {
                            const data = JSON.parse(p.ocrJson);
                            return (
                              <button onClick={() => setOcrPedido(p)} style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <ZoomIn size={14} /> {data.entidad || 'OCR'} ${data.monto || ''}
                              </button>
                            );
                          } catch { return <span style={{ color: '#999', fontSize: '0.85rem' }}>{p.ocrJson}</span>; }
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ocrPedido && <OCRModal pedido={ocrPedido} onClose={() => setOcrPedido(null)} />}
      {lightboxSrc && <Lightbox src={lightboxSrc} alt="Comprobante" onClose={() => setLightboxSrc(null)} />}
    </div>
  );
};

export default AceptarPedidos;
