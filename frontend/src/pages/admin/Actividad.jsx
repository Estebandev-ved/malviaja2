import { useState, useEffect } from 'react';
import { Activity, Trash2, Filter, LogIn, ShoppingBag, Package, Tag, MessageSquare, Settings, RefreshCw } from 'lucide-react';
import { getLogs, clearLogs, logActivity } from '../../utils/activityLog';

const card = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const TIPO_CONFIG = {
  LOGIN: { color: '#2196f3', bg: '#e3f2fd', icon: <LogIn size={14} />, label: 'Acceso' },
  PEDIDO: { color: '#4caf50', bg: '#e8f5e9', icon: <ShoppingBag size={14} />, label: 'Pedido' },
  INVENTARIO: { color: '#ff9800', bg: '#fff3e0', icon: <Package size={14} />, label: 'Inventario' },
  CUPON: { color: '#9c27b0', bg: '#f3e5f5', icon: <Tag size={14} />, label: 'Cupón' },
  MENSAJE: { color: '#00bcd4', bg: '#e0f7fa', icon: <MessageSquare size={14} />, label: 'Mensaje' },
  CONFIG: { color: '#607d8b', bg: '#eceff1', icon: <Settings size={14} />, label: 'Config' },
  USUARIO: { color: '#e91e63', bg: '#fce4ec', icon: <Activity size={14} />, label: 'Usuario' },
};

const DEFAULT = { color: '#9e9e9e', bg: '#f5f5f5', icon: <Activity size={14} />, label: 'Otro' };

const Actividad = () => {
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  const cargar = () => setLogs(getLogs());

  useEffect(() => {
    cargar();
    // Registrar esta visita
    logActivity('LOGIN', 'Admin accedió al Registro de Actividad');
    cargar();
  }, []);

  const limpiar = () => {
    if (!confirm('¿Borrar todo el historial de actividad?')) return;
    clearLogs();
    cargar();
  };

  const tiposUnicos = ['TODOS', ...Object.keys(TIPO_CONFIG)];

  const logsFiltrados = logs.filter(l => {
    const matchTipo = filtro === 'TODOS' || l.tipo === filtro;
    const matchBusqueda = l.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.usuario.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  const contadorPorTipo = {};
  logs.forEach(l => { contadorPorTipo[l.tipo] = (contadorPorTipo[l.tipo] || 0) + 1; });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>📋 Registro de Actividad</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={cargar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>
            <RefreshCw size={15} /> Actualizar
          </button>
          <button onClick={limpiar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#c62828', fontWeight: 'bold' }}>
            <Trash2 size={15} /> Limpiar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(TIPO_CONFIG).map(([tipo, cfg]) => (
          <div
            key={tipo}
            onClick={() => setFiltro(filtro === tipo ? 'TODOS' : tipo)}
            style={{ ...card, cursor: 'pointer', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', outline: filtro === tipo ? `2px solid ${cfg.color}` : 'none', transition: 'outline 0.15s' }}
          >
            <div style={{ background: cfg.bg, color: cfg.color, padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>{cfg.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{cfg.label}</p>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>{contadorPorTipo[tipo] || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ ...card, marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
          <Filter size={16} /> Filtrar:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tiposUnicos.map(t => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              style={{ padding: '0.3rem 0.75rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: filtro === t ? 'bold' : 'normal', background: filtro === t ? 'var(--color-primary)' : 'white', color: filtro === t ? 'white' : 'var(--color-text)' }}
            >
              {t === 'TODOS' ? 'Todos' : (TIPO_CONFIG[t]?.label || t)}
            </button>
          ))}
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-full)', outline: 'none', fontSize: '0.9rem' }}
        />
      </div>

      {/* Tabla de logs */}
      <div style={card}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>
          Historial ({logsFiltrados.length} de {logs.length})
        </h2>
        {logsFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
            <Activity size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>{logs.length === 0 ? 'No hay actividad registrada aún.' : 'No hay resultados para este filtro.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f4f6f8' }}>
                  {['Tipo', 'Descripción', 'Usuario', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map(log => {
                  const cfg = TIPO_CONFIG[log.tipo] || DEFAULT;
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{log.descripcion}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{log.usuario}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
                        {new Date(log.fecha).toLocaleString('es-CO')}
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

export default Actividad;
