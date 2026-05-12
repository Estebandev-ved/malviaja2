import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Award, RefreshCw } from 'lucide-react';
import { authFetch } from '../../api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4'];

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const card = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const Reportes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('semana');

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/pedidos/todos');
      if (r.ok) {
        const data = await r.json();
        const lista = Array.isArray(data) ? data : data?.content || [];
        setPedidos(lista);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- Cálculos de datos ---

  const entregados = pedidos.filter(p => p.estado === 'ENTREGADO');
  const totalIngresos = entregados.reduce((s, p) => s + (p.total || 0), 0);
  const ticketPromedio = entregados.length ? totalIngresos / entregados.length : 0;

  // Ventas por día de la semana
  const ventasDia = Array(7).fill(0).map((_, i) => ({ dia: DIAS_ES[i], ventas: 0, pedidos: 0 }));
  pedidos.forEach(p => {
    if (!p.fechaPedido) return;
    const d = new Date(p.fechaPedido).getDay();
    if (Number.isNaN(d)) return;
    ventasDia[d].ventas += p.total || 0;
    ventasDia[d].pedidos += 1;
  });

  // Ventas por mes (últimos 6 meses)
  const ahora = new Date();
  const ventasMes = [];
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    const total = pedidos
      .filter(p => {
        if (!p.fechaPedido) return false;
        const d = new Date(p.fechaPedido);
        return !Number.isNaN(d.getTime()) && d.getMonth() === mes && d.getFullYear() === anio;
      })
      .reduce((s, p) => s + (p.total || 0), 0);
    ventasMes.push({ mes: MESES_ES[mes], total });
  }

  // Horas pico
  const horasData = Array(24).fill(0).map((_, h) => ({ hora: `${h}h`, pedidos: 0 }));
  pedidos.forEach(p => {
    if (!p.fechaPedido) return;
    const h = new Date(p.fechaPedido).getHours();
    if (Number.isNaN(h)) return;
    horasData[h].pedidos += 1;
  });
  const horasVis = horasData.filter((_, i) => i % 2 === 0);

  // Productos más vendidos
  const productosMap = {};
  pedidos.forEach(p => {
    try {
      const carrito = JSON.parse(p.carritoJson || '[]');
      carrito.forEach(item => {
        const key = item.nombre || 'Desconocido';
        productosMap[key] = (productosMap[key] || 0) + (item.cantidad || 1);
      });
    } catch (_) {}
  });
  const topProductos = Object.entries(productosMap)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Distribución de estados
  const estadosMap = {};
  pedidos.forEach(p => { estadosMap[p.estado] = (estadosMap[p.estado] || 0) + 1; });
  const estadosData = Object.entries(estadosMap).map(([name, value]) => ({ name, value }));

  const formatCOP = (v) => `$${Number(v).toLocaleString('es-CO')}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>📈 Reportes y Analítica</h1>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Ingresos Totales', value: formatCOP(totalIngresos), icon: <DollarSign size={22} />, color: '#4caf50' },
          { label: 'Pedidos Totales', value: pedidos.length, icon: <ShoppingBag size={22} />, color: '#2196f3' },
          { label: 'Ticket Promedio', value: formatCOP(ticketPromedio), icon: <TrendingUp size={22} />, color: '#ff9800' },
          { label: 'Tasa Entrega', value: pedidos.length ? `${Math.round(entregados.length / pedidos.length * 100)}%` : '0%', icon: <Award size={22} />, color: '#9c27b0' },
        ].map((kpi, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: `${kpi.color}18`, color: kpi.color, padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              {kpi.icon}
            </div>
            <div>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{kpi.label}</p>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ventas por mes + Horas pico */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Ventas por Mes</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ventasMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCOP(v)} />
              <Line type="monotone" dataKey="total" stroke="#4caf50" strokeWidth={2.5} dot={{ fill: '#4caf50', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Estados de Pedidos</h2>
          {estadosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={estadosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {estadosData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--color-text-light)', textAlign: 'center', paddingTop: '4rem' }}>Sin datos aún</p>
          )}
        </div>
      </div>

      {/* Ventas por día + Horas pico */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Pedidos por Día de la Semana</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ventasDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#2196f3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Horas Pico</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={horasVis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#ff9800" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top productos */}
      <div style={card}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>🏆 Productos Más Vendidos</h2>
        {topProductos.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '2rem' }}>Sin datos de ventas aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topProductos.map((p, i) => {
              const maxVal = topProductos[0].cantidad;
              const pct = (p.cantidad / maxVal) * 100;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ width: '1.6rem', height: '1.6rem', background: COLORS[i], color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{p.nombre}</span>
                  <div style={{ flex: 2, background: '#f4f6f8', borderRadius: 'var(--radius-full)', height: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: COLORS[i], borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', minWidth: '3rem', textAlign: 'right' }}>{p.cantidad}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
