import { useState, useEffect } from 'react';
import { Package, Users, DollarSign, TrendingUp, RefreshCw, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import DeliveryCalculator from '../../components/admin/DeliveryCalculator';
import { authFetch } from '../../api';
import useCountUp from '../../utils/useCountUp';

const ESTADO_STYLES = {
  PENDIENTE: { bg: '#fff3e0', color: '#e65100', icon: <Clock size={14} />, label: 'Pendiente' },
  PAGADO: { bg: '#e8f5e9', color: '#1b5e20', icon: <CheckCircle2 size={14} />, label: 'Pagado' },
  REVISION_MANUAL: { bg: '#f3e5f5', color: '#6a1b9a', icon: <Clock size={14} />, label: 'Revisión Manual' },
  ACEPTADO: { bg: '#e3f2fd', color: '#1565c0', icon: <CheckCircle2 size={14} />, label: 'Aceptado' },
  PREPARANDO: { bg: '#fff9c4', color: '#f57f17', icon: <Package size={14} />, label: 'Preparando' },
  EN_CAMINO: { bg: '#e8f5e9', color: '#2e7d32', icon: <Truck size={14} />, label: 'En Camino' },
  ENTREGADO: { bg: '#c8e6c9', color: '#1b5e20', icon: <CheckCircle2 size={14} />, label: 'Entregado' },
  CANCELADO: { bg: '#ffebee', color: '#c62828', icon: <XCircle size={14} />, label: 'Cancelado' },
};

const KpiCard = ({ stat, loading }) => {
  const isCurrency = typeof stat.value === 'string' && stat.value.startsWith('$');
  const rawNumber = isCurrency ? parseInt(stat.value.replace(/[$,]/g, '')) : stat.value;
  const displayValue = useCountUp(rawNumber, 1000, !loading && rawNumber > 0);

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ background: `${stat.color}15`, color: stat.color, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
        {stat.icon}
      </div>
      <div>
        <h3 style={{ color: 'var(--color-text-light)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{stat.title}</h3>
        <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
          {isCurrency ? `$${displayValue.toLocaleString()}` : displayValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pedidosRes, usuariosRes] = await Promise.all([
        authFetch('/api/pedidos/todos'),
        authFetch('/api/pedidos/usuarios/todos')
      ]);

      if (pedidosRes.ok) {
        const data = await pedidosRes.json();
        // El backend devuelve un objeto Page, los datos están en 'content'
        setPedidos(Array.isArray(data) ? data : (data.content || []));
      }
      if (usuariosRes.ok) {
        const data = await usuariosRes.json();
        setUsuarios(data);
      }
    } catch (e) {
      console.warn("Backend no disponible para datos admin:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Estadísticas calculadas
  const ventasMes = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
  const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
  const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;

  const stats = [
    { title: 'Ventas Totales', value: `$${ventasMes.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#4caf50' },
    { title: 'Pedidos Pendientes', value: pendientes, icon: <Clock size={24} />, color: '#ff9800' },
    { title: 'Pedidos Entregados', value: entregados, icon: <CheckCircle2 size={24} />, color: '#2196f3' },
    { title: 'Clientes Registrados', value: usuarios.length, icon: <Users size={24} />, color: '#9c27b0' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Dashboard</h1>
        <button 
          onClick={fetchData} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <KpiCard key={i} stat={stat} loading={loading} />
        ))}
      </div>

      {/* Calculadora de Envío */}
      <DeliveryCalculator />

      {/* Últimos Pedidos Reales */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
          📋 Últimos Pedidos ({pedidos.length})
        </h2>
        
        {pedidos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>
            {loading ? 'Cargando pedidos...' : 'No hay pedidos registrados aún. ¡Los pedidos aparecerán aquí automáticamente!'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f4f6f8' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Cliente</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Dirección</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Total</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Estado</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(0, 20).map((pedido) => {
                  const estadoStyle = ESTADO_STYLES[pedido.estado] || ESTADO_STYLES.PENDIENTE;
                  return (
                    <tr key={pedido.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>#{pedido.id}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{pedido.nombreReceptor || 'Sin nombre'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pedido.direccionEnvio || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>${(pedido.total || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: estadoStyle.bg, color: estadoStyle.color, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {estadoStyle.icon} {estadoStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-CO') : '-'}
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

export default Dashboard;
