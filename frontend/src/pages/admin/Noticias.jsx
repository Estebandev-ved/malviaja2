import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Megaphone, Gift, Zap, Star, Trophy, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'admin_noticias';

const TIPOS = [
  { value: 'sorteo', label: '🎟️ Sorteo', icon: Trophy },
  { value: 'descuento', label: '🔥 Descuento', icon: Gift },
  { value: 'nuevo_producto', label: '🍫 Nuevo Producto', icon: Zap },
  { value: 'general', label: '📢 Novedad', icon: Megaphone },
];

const NoticiasAdmin = () => {
  const [noticias, setNoticias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'general', activo: true });

  useEffect(() => {
    setNoticias(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  }, []);

  const guardar = (lista) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    setNoticias(lista);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    if (editando) {
      guardar(noticias.map(n => n.id === editando ? { ...n, ...form } : n));
      setEditando(null);
    } else {
      guardar([{ id: Date.now(), fecha: new Date().toISOString().split('T')[0], ...form }, ...noticias]);
    }
    setForm({ titulo: '', descripcion: '', tipo: 'general', activo: true });
  };

  const editar = (n) => {
    setEditando(n.id);
    setForm({ titulo: n.titulo, descripcion: n.descripcion, tipo: n.tipo, activo: n.activo });
  };

  const eliminar = (id) => {
    if (confirm('¿Eliminar esta noticia?')) guardar(noticias.filter(n => n.id !== id));
  };

  const toggleActivo = (id) => {
    guardar(noticias.map(n => n.id === id ? { ...n, activo: !n.activo } : n));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Megaphone size={24} className="text-secondary" /> Noticias del Club
        </h1>
        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' }}>
          {noticias.filter(n => n.activo).length} activas
        </span>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', alignItems: 'start' }}>
        {/* Formulario */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
            {editando ? '✏️ Editar Noticia' : '➕ Nueva Noticia'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Título de la noticia" required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
            <textarea placeholder="Descripción (markdown simple)" rows={4} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical' }} />
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text)' }}>Activa:</label>
              <div onClick={() => setForm({...form, activo: !form.activo})} style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.activo ? '#4caf50' : '#ccc', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: form.activo ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn--primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} /> {editando ? 'Actualizar' : 'Publicar'}
              </button>
              {editando && (
                <button type="button" className="btn" style={{ border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => { setEditando(null); setForm({ titulo: '', descripcion: '', tipo: 'general', activo: true }); }}>
                  <X size={16} /> Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de noticias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {noticias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text-light)' }}>
              <Megaphone size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No hay noticias aún. ¡Crea la primera!</p>
            </div>
          ) : (
            noticias.map(n => {
              const tipo = TIPOS.find(t => t.value === n.tipo) || TIPOS[3];
              return (
                <div key={n.id} style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: `1px solid ${n.activo ? 'rgba(0,0,0,0.06)' : '#ffcdd2'}`, opacity: n.activo ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        {n.tipo === 'sorteo' && <Trophy size={16} style={{ color: '#ff9800' }} />}
                        {n.tipo === 'descuento' && <Gift size={16} style={{ color: '#4caf50' }} />}
                        {n.tipo === 'nuevo_producto' && <Zap size={16} style={{ color: '#2196f3' }} />}
                        {n.tipo === 'general' && <Megaphone size={16} style={{ color: '#9c27b0' }} />}
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', background: '#f5f5f5', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{tipo.label}</span>
                        <span style={{ fontSize: '0.7rem', color: '#999' }}>{n.fecha}</span>
                        {!n.activo && <span style={{ fontSize: '0.7rem', color: '#c62828', fontWeight: 'bold' }}>INACTIVA</span>}
                      </div>
                      <h4 style={{ margin: '0.25rem 0 0.25rem', color: 'var(--color-primary-dark)' }}>{n.titulo}</h4>
                      {n.descripcion && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>{n.descripcion}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                      <button onClick={() => toggleActivo(n.id)} style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', color: n.activo ? '#4caf50' : '#999' }}>
                        {n.activo ? 'Activa' : 'Inactiva'}
                      </button>
                      <button onClick={() => editar(n)} style={{ border: '1px solid #e0e0e0', background: 'white', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => eliminar(n.id)} style={{ border: '1px solid #f44336', background: '#fff5f5', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={14} color="#c62828" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticiasAdmin;