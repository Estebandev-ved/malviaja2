import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RefreshCw, Truck, XCircle, Package } from 'lucide-react';
import { authFetch } from '../../api';

const ESTADO_META = {
  PENDIENTE: { label: 'Pendiente', color: '#e65100', bg: '#fff3e0', icon: <Clock size={14} /> },
  PREPARANDO: { label: 'Preparando', color: '#f57f17', bg: '#fff9c4', icon: <Package size={14} /> },
  EN_CAMINO: { label: 'En Camino', color: '#2e7d32', bg: '#e8f5e9', icon: <Truck size={14} /> },
  ENTREGADO: { label: 'Entregado', color: '#1b5e20', bg: '#c8e6c9', icon: <CheckCircle2 size={14} /> },
  CANCELADO: { label: 'Cancelado', color: '#c62828', bg: '#ffebee', icon: <XCircle size={14} /> },
};

const card = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const AceptarPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('PENDIENTE');
  const [updating, setUpdating] = useState(null);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/pedidos/todos');
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data?.content || [];
        setPedidos(lista);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const pendientes = useMemo(() => pedidos.filter(p => p.estado === 'PENDIENTE'), [pedidos]);
  const enProceso = useMemo(() => pedidos.filter(p => ['PREPARANDO', 'EN_CAMINO'].includes(p.estado)), [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    if (filtro === 'TODOS') return pedidos;
    if (filtro === 'EN_PROCESO') return enProceso;
    return pedidos.filter(p => p.estado === filtro);
  }, [filtro, pedidos, enProceso]);

  const actualizarEstado = async (pedidoId, estado) => {
    setUpdating(pedidoId);
    try {
      const res = await authFetch(`/api/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        const actualizado = await res.json();
        setPedidos(prev => prev.map(p => (p.id === pedidoId ? actualizado : p)));
      }
    } catch (_) {}
    setUpdating(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>✅ Aceptar Pedidos</h1>
        <button onClick={fetchPedidos} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pendientes', value: pendientes.length, color: '#ff9800' },
          { label: 'En Proceso', value: enProceso.length, color: '#4caf50' },
          { label: 'Total', value: pedidos.length, color: '#2196f3' },
        ].map((stat, i) => (
          <div key={i} style={{ ...card, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stat.color }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{stat.label}</p>
              <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['PENDIENTE', 'EN_PROCESO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'TODOS'].map((item) => {
          const meta = ESTADO_META[item] || { color: '#666' };
          return (
            <button
              key={item}
              onClick={() => setFiltro(item)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: `1px solid ${meta.color || '#ddd'}`,
                background: filtro === item ? meta.color : 'white',
                color: filtro === item ? 'white' : 'var(--color-text)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {item === 'EN_PROCESO' ? 'En Proceso' : item}
            </button>
          );
        })}
      </div>

      <div style={card}>
        {pedidosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>
            {loading ? 'Cargando pedidos...' : 'No hay pedidos para este filtro'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f4f6f8' }}>
                  {['Pedido', 'Cliente', 'Direccion', 'Total', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((p) => {
                  const meta = ESTADO_META[p.estado] || ESTADO_META.PENDIENTE;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>#{p.id}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.nombreReceptor || 'Sin nombre'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccionEnvio || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>${(p.total || 0).toLocaleString('es-CO')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: meta.bg, color: meta.color, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {p.estado === 'PENDIENTE' && (
                            <button
                              onClick={() => actualizarEstado(p.id, 'PREPARANDO')}
                              disabled={updating === p.id}
                              style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.35rem 0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Aceptar
                            </button>
                          )}
                          {p.estado === 'PREPARANDO' && (
                            <button
                              onClick={() => actualizarEstado(p.id, 'EN_CAMINO')}
                              disabled={updating === p.id}
                              style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.35rem 0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              En camino
                            </button>
                          )}
                          {p.estado === 'EN_CAMINO' && (
                            <button
                              onClick={() => actualizarEstado(p.id, 'ENTREGADO')}
                              disabled={updating === p.id}
                              style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.35rem 0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Entregado
                            </button>
                          )}
                          {p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && (
                            <button
                              onClick={() => actualizarEstado(p.id, 'CANCELADO')}
                              disabled={updating === p.id}
                              style={{ border: '1px solid #f44336', background: '#fff5f5', color: '#c62828', padding: '0.35rem 0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AceptarPedidos;
