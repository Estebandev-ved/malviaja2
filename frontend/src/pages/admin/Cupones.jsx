import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Copy, Check } from 'lucide-react';
import { logActivity } from '../../utils/activityLog';

const KEY = 'admin_cupones';
const card = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const TIPOS = [
  { value: 'PORCENTAJE', label: '% Descuento' },
  { value: 'MONTO', label: 'Monto Fijo ($)' },
  { value: 'ENVIO_GRATIS', label: 'Envío Gratis' },
];

const empty = {
  codigo: '', nombre: '', tipo: 'PORCENTAJE', valor: '', fechaExpiracion: '',
  limiteUsos: '', activo: true,
};

const Cupones = () => {
  const [cupones, setCupones] = useState([]);
  const [form, setForm] = useState(empty);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    setCupones(JSON.parse(localStorage.getItem(KEY) || '[]'));
  }, []);

  const guardar = (lista) => {
    setCupones(lista);
    localStorage.setItem(KEY, JSON.stringify(lista));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.codigo.trim()) return;
    const nuevo = { ...form, id: Date.now(), usosActuales: 0, creadoEn: new Date().toISOString() };
    guardar([nuevo, ...cupones]);
    logActivity('CUPON', `Cupón creado: ${form.codigo}`);
    setForm(empty);
    setMostrarForm(false);
  };

  const toggleActivo = (id) => {
    const lista = cupones.map(c => c.id === id ? { ...c, activo: !c.activo } : c);
    guardar(lista);
    const c = cupones.find(c => c.id === id);
    logActivity('CUPON', `Cupón ${c.codigo} ${c.activo ? 'desactivado' : 'activado'}`);
  };

  const eliminar = (id) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    const c = cupones.find(c => c.id === id);
    guardar(cupones.filter(c => c.id !== id));
    logActivity('CUPON', `Cupón eliminado: ${c.codigo}`);
  };

  const copiar = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const estaVencido = (fecha) => fecha && new Date(fecha) < new Date();

  const getBadge = (c) => {
    if (!c.activo) return { bg: '#f5f5f5', color: '#9e9e9e', label: 'Inactivo' };
    if (estaVencido(c.fechaExpiracion)) return { bg: '#ffebee', color: '#c62828', label: 'Vencido' };
    if (c.limiteUsos && c.usosActuales >= c.limiteUsos) return { bg: '#fff3e0', color: '#e65100', label: 'Agotado' };
    return { bg: '#e8f5e9', color: '#2e7d32', label: 'Activo' };
  };

  const getDescuento = (c) => {
    if (c.tipo === 'PORCENTAJE') return `${c.valor}% OFF`;
    if (c.tipo === 'MONTO') return `$${Number(c.valor).toLocaleString()} OFF`;
    return 'Envío Gratis';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>🎟️ Gestión de Cupones</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Nuevo Cupón
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div style={{ ...card, marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Crear Cupón</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Código Promocional *', key: 'codigo', placeholder: 'VERANO20', transform: v => v.toUpperCase() },
                { label: 'Nombre / Descripción', key: 'nombre', placeholder: 'Descuento verano' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: f.transform ? f.transform(e.target.value) : e.target.value })}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Tipo de Descuento</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.9rem', background: 'white' }}
                >
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {form.tipo !== 'ENVIO_GRATIS' && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                    {form.tipo === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Monto ($)'}
                  </label>
                  <input
                    type="number"
                    value={form.valor}
                    onChange={e => setForm({ ...form, valor: e.target.value })}
                    placeholder={form.tipo === 'PORCENTAJE' ? '20' : '5000'}
                    min="0"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Fecha de Expiración</label>
                <input
                  type="date"
                  value={form.fechaExpiracion}
                  onChange={e => setForm({ ...form, fechaExpiracion: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Límite de Usos</label>
                <input
                  type="number"
                  value={form.limiteUsos}
                  onChange={e => setForm({ ...form, limiteUsos: e.target.value })}
                  placeholder="Sin límite"
                  min="1"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setMostrarForm(false)} style={{ padding: '0.6rem 1.2rem', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'white' }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '0.6rem 1.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>
                Crear Cupón
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de cupones */}
      <div style={card}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>
          Cupones ({cupones.length})
        </h2>

        {cupones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
            <Tag size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No hay cupones creados. ¡Crea el primero!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cupones.map(c => {
              const badge = getBadge(c);
              return (
                <div key={c.id} style={{ border: '1px solid #f0f0f0', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: !c.activo ? 0.6 : 1 }}>
                  <div style={{ background: '#f4f6f8', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '2px', color: 'var(--color-primary-dark)', minWidth: '120px', textAlign: 'center' }}>
                    {c.codigo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{c.nombre || c.codigo}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                      {getDescuento(c)}
                      {c.fechaExpiracion && ` · Vence: ${new Date(c.fechaExpiracion).toLocaleDateString('es-CO')}`}
                      {c.limiteUsos && ` · ${c.usosActuales}/${c.limiteUsos} usos`}
                    </p>
                  </div>
                  <span style={{ background: badge.bg, color: badge.color, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {badge.label}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => copiar(c.codigo)} title="Copiar código" style={{ padding: '0.4rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', color: copiado === c.codigo ? '#4caf50' : '#666' }}>
                      {copiado === c.codigo ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => toggleActivo(c.id)} title={c.activo ? 'Desactivar' : 'Activar'} style={{ padding: '0.4rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', color: c.activo ? '#4caf50' : '#9e9e9e' }}>
                      {c.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => eliminar(c.id)} title="Eliminar" style={{ padding: '0.4rem', border: '1px solid #ffcdd2', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', color: '#f44336' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cupones;
