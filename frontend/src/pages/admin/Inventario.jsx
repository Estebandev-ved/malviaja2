import { useState, useEffect } from 'react';
import { Package, AlertTriangle, RefreshCw, TrendingDown, Edit2, Check, X, Bell } from 'lucide-react';
import { logActivity } from '../../utils/activityLog';
import { authFetch } from '../../api';
import useStore from '../../store/useStore';

const KEY_MOVIMIENTOS = 'admin_inventario_movimientos';
const KEY_UMBRAL = 'admin_inventario_umbral';

const card = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const getStockStatus = (stock, umbral) => {
  if (stock === 0) return { color: '#f44336', bg: '#ffebee', label: 'Sin Stock', icon: '🔴' };
  if (stock <= umbral) return { color: '#ff9800', bg: '#fff3e0', label: 'Stock Bajo', icon: '🟡' };
  return { color: '#4caf50', bg: '#e8f5e9', label: 'Disponible', icon: '🟢' };
};

const Inventario = () => {
  const storeProductos = useStore(s => s.productos);
  const storeFetch = useStore(s => s.fetchProductos);
  const [umbral, setUmbral] = useState(() => Number(localStorage.getItem(KEY_UMBRAL)) || 5);
  const [editandoStock, setEditandoStock] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [editandoUmbral, setEditandoUmbral] = useState(false);
  const [umbralTmp, setUmbralTmp] = useState(umbral);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setLocalLoading(true);
    storeFetch().finally(() => setLocalLoading(false));
    setMovimientos(JSON.parse(localStorage.getItem(KEY_MOVIMIENTOS) || '[]'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productos = storeProductos;

  const guardarMovimiento = (producto, stockAnterior, stockNuevo) => {
    const mov = {
      id: Date.now(),
      productoId: producto.id,
      productoNombre: producto.nombre,
      stockAnterior,
      stockNuevo,
      diferencia: stockNuevo - stockAnterior,
      fecha: new Date().toISOString(),
    };
    const lista = [mov, ...movimientos].slice(0, 200);
    setMovimientos(lista);
    localStorage.setItem(KEY_MOVIMIENTOS, JSON.stringify(lista));
  };

  const actualizarStock = async (producto) => {
    const nuevo = parseInt(nuevoStock);
    if (isNaN(nuevo) || nuevo < 0) return;
    try {
      await authFetch(`/api/productos/${producto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...producto, stock: nuevo }),
      });
      guardarMovimiento(producto, producto.stock, nuevo);
      logActivity('INVENTARIO', `Stock de "${producto.nombre}" actualizado: ${producto.stock} → ${nuevo}`);
      useStore.setState(state => ({
        productos: state.productos.map(pr => pr.id === producto.id ? { ...pr, stock: nuevo } : pr)
      }));
    } catch (_) {
      guardarMovimiento(producto, producto.stock, nuevo);
      useStore.setState(state => ({
        productos: state.productos.map(pr => pr.id === producto.id ? { ...pr, stock: nuevo } : pr)
      }));
    }
    setEditandoStock(null);
    setNuevoStock('');
  };

  const guardarUmbral = () => {
    const v = parseInt(umbralTmp);
    if (!isNaN(v) && v >= 0) {
      setUmbral(v);
      localStorage.setItem(KEY_UMBRAL, v);
    }
    setEditandoUmbral(false);
  };

  const productosAlerta = productos.filter(p => p.stock <= umbral);
  const sinStock = productos.filter(p => p.stock === 0);
  const stockOk = productos.filter(p => p.stock > umbral);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>📦 Control de Inventario</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.8rem' }}>
            <Bell size={15} style={{ color: '#ff9800' }} />
            <span style={{ fontSize: '0.85rem' }}>Alerta con:</span>
            {editandoUmbral ? (
              <>
                <input type="number" value={umbralTmp} onChange={e => setUmbralTmp(e.target.value)} min="0" style={{ width: '50px', padding: '0.2rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }} />
                <button onClick={guardarUmbral} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4caf50' }}><Check size={15} /></button>
                <button onClick={() => setEditandoUmbral(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f44336' }}><X size={15} /></button>
              </>
            ) : (
              <>
                <strong>{umbral} uds</strong>
                <button onClick={() => { setEditandoUmbral(true); setUmbralTmp(umbral); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><Edit2 size={14} /></button>
              </>
            )}
          </div>
          <button onClick={fetchProductos} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Productos', value: productos.length, color: '#2196f3', icon: <Package size={22} /> },
          { label: 'Stock Bajo', value: productosAlerta.length, color: '#ff9800', icon: <AlertTriangle size={22} /> },
          { label: 'Sin Stock', value: sinStock.length, color: '#f44336', icon: <TrendingDown size={22} /> },
          { label: 'Disponibles', value: stockOk.length, color: '#4caf50', icon: <Check size={22} /> },
        ].map((kpi, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: `${kpi.color}18`, color: kpi.color, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>{kpi.icon}</div>
            <div>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{kpi.label}</p>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {productosAlerta.length > 0 && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={20} style={{ color: '#ff9800', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong>{productosAlerta.length} producto(s) con stock bajo o sin stock:</strong>{' '}
            {productosAlerta.map(p => p.nombre).join(', ')}
          </p>
        </div>
      )}

      {/* Tabla de productos */}
      <div style={{ ...card, marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Estado del Inventario</h2>
        {productos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>
            {localLoading ? 'Cargando productos...' : 'No hay productos en la base de datos. Ve a /admin/productos para crear algunos.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f4f6f8' }}>
                  {['Producto', 'Stock', 'Barra', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.map(p => {
                  const status = getStockStatus(p.stock, umbral);
                  const maxStock = Math.max(...productos.map(x => x.stock || 0), 1);
                  const pct = Math.min((p.stock / maxStock) * 100, 100);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />}
                          <span style={{ fontWeight: '600' }}>{p.nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {editandoStock === p.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              value={nuevoStock}
                              onChange={e => setNuevoStock(e.target.value)}
                              min="0"
                              autoFocus
                              style={{ width: '60px', padding: '0.3rem', border: '1px solid var(--color-primary)', borderRadius: '4px', textAlign: 'center' }}
                            />
                            <button onClick={() => actualizarStock(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4caf50' }}><Check size={16} /></button>
                            <button onClick={() => setEditandoStock(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f44336' }}><X size={16} /></button>
                          </div>
                        ) : (
                          p.stock ?? '—'
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', minWidth: '120px' }}>
                        <div style={{ background: '#f4f6f8', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: status.color, borderRadius: 'var(--radius-full)', transition: 'width 0.4s' }} />
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: status.bg, color: status.color, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => { setEditandoStock(p.id); setNuevoStock(p.stock ?? 0); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          <Edit2 size={14} /> Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de movimientos */}
      <div style={card}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>
          📋 Historial de Movimientos ({movimientos.length})
        </h2>
        {movimientos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>No hay movimientos registrados</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f4f6f8' }}>
                  {['Producto', 'Anterior', 'Nuevo', 'Diferencia', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movimientos.slice(0, 30).map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{m.productoNombre}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{m.stockAnterior}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>{m.stockNuevo}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: m.diferencia >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                        {m.diferencia >= 0 ? '+' : ''}{m.diferencia}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                      {new Date(m.fecha).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;
