import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Package, Loader2 } from 'lucide-react';
import { authFetch, apiFetch } from '../../api';

const ProductosAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', precio: '', descripcion: '', dosis: '', stock: '', imageUrl: '' });

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (e) {
      console.warn("Error cargando productos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  const handleSave = async () => {
    const url = editingId ? `/api/productos/${editingId}` : '/api/productos';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: Number(formData.precio),
          stock: Number(formData.stock) || 0
        })
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ nombre: '', precio: '', descripcion: '', dosis: '', stock: '', imageUrl: '' });
        fetchProductos();
      }
    } catch (e) {
      alert("Error al guardar el producto.");
    }
  };

  const handleEdit = (producto) => {
    setEditingId(producto.id);
    setFormData({
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      descripcion: producto.descripcion || '',
      dosis: producto.dosis || '',
      stock: producto.stock || '',
      imageUrl: producto.imageUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await authFetch(`/api/productos/${id}`, { method: 'DELETE' });
      fetchProductos();
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Gestión de Productos</h1>
        <button 
          className="btn btn--primary"
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ nombre: '', precio: '', descripcion: '', dosis: '', stock: '', imageUrl: '' }); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', marginBottom: '2rem', border: '2px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--color-primary-dark)', margin: 0 }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Nombre</label>
              <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="Brownie Espacial" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Precio ($)</label>
              <input type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="15000" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Dosis</label>
              <input type="text" value={formData.dosis} onChange={e => setFormData({...formData, dosis: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="Media, Alta..." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Stock</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="50" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Descripción</label>
              <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}
                rows={3} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }} placeholder="Descripción del producto..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>URL de Imagen</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSave} className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {editingId ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Productos */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} />
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No hay productos. ¡Crea el primero!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f4f6f8' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Producto</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Precio</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Dosis</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Stock</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f4f6f8' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.imageUrl && <img src={p.imageUrl} alt={p.nombre} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{p.nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>${(p.precio || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{p.dosis || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: (p.stock || 0) > 10 ? '#e8f5e9' : (p.stock || 0) > 0 ? '#fff3e0' : '#ffebee', color: (p.stock || 0) > 10 ? '#2e7d32' : (p.stock || 0) > 0 ? '#e65100' : '#c62828', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', marginRight: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Edit3 size={14} /> Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductosAdmin;
