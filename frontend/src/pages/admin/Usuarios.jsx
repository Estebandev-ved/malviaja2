import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff, Package, DollarSign, Calendar, Mail, Phone, MapPin, Crown, Loader2, RefreshCw } from 'lucide-react';
import { authFetch } from '../../api';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [pedidosPorUsuario, setPedidosPorUsuario] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, pedidosRes] = await Promise.all([
        authFetch('/api/pedidos/usuarios/todos'),
        authFetch('/api/pedidos/todos')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsuarios(usersData);
      }

      if (pedidosRes.ok) {
        const pedidosData = await pedidosRes.json();
        const pedidosArray = Array.isArray(pedidosData) ? pedidosData : (pedidosData.content || []);
        const grouped = {};
        pedidosArray.forEach(p => {
          const uid = p.usuario?.id;
          if (uid) {
            if (!grouped[uid]) grouped[uid] = [];
            grouped[uid].push(p);
          }
        });
        setPedidosPorUsuario(grouped);
      }
    } catch (e) {
      console.warn("Error cargando datos de usuarios:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleRol = async (usuario) => {
    const nuevoRol = usuario.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await authFetch(`/api/pedidos/usuarios/${usuario.id}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol })
      });
      if (res.ok) {
        fetchData();
        alert(`Usuario ${usuario.nombre || usuario.email} ahora es ${nuevoRol}`);
      }
    } catch (e) {
      alert("Error al cambiar el rol.");
    }
  };

  const filteredUsers = usuarios.filter(u =>
    (u.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.firebaseUid || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserStats = (userId) => {
    const pedidos = pedidosPorUsuario[userId] || [];
    const totalGastado = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;
    return { totalPedidos: pedidos.length, totalGastado, entregados, pedidos };
  };

  const getTier = (totalGastado) => {
    if (totalGastado >= 500000) return { name: 'VIP Diamante', color: '#e1bee7', textColor: '#6a1b9a', icon: '💎' };
    if (totalGastado >= 200000) return { name: 'VIP Oro', color: '#fff9c4', textColor: '#f57f17', icon: '🥇' };
    if (totalGastado >= 100000) return { name: 'VIP Plata', color: '#e0e0e0', textColor: '#424242', icon: '🥈' };
    return { name: 'Nuevo', color: '#e3f2fd', textColor: '#1565c0', icon: '🌱' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Gestión de Usuarios</h1>
        <button onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Stats Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e3f2fd', color: '#1565c0', padding: '0.6rem', borderRadius: '8px' }}><Users size={20} /></div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>Total Usuarios</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{usuarios.length}</p>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fce4ec', color: '#c62828', padding: '0.6rem', borderRadius: '8px' }}><Shield size={20} /></div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>Administradores</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{usuarios.filter(u => u.rol === 'ADMIN').length}</p>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fff9c4', color: '#f57f17', padding: '0.6rem', borderRadius: '8px' }}><Crown size={20} /></div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>Clientes VIP</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{usuarios.filter(u => getUserStats(u.id).totalGastado >= 100000).length}</p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, email o UID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '0.95rem', background: 'white' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Lista de Usuarios */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /></div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>No se encontraron usuarios.</div>
          ) : (
            filteredUsers.map(usuario => {
              const stats = getUserStats(usuario.id);
              const tier = getTier(stats.totalGastado);
              return (
                <div 
                  key={usuario.id}
                  onClick={() => setSelectedUser(usuario)}
                  style={{ 
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f4f6f8', cursor: 'pointer',
                    background: selectedUser?.id === usuario.id ? '#f0f7ff' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {(usuario.nombre || usuario.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {usuario.nombre || 'Sin nombre'}
                          {usuario.rol === 'ADMIN' && <Shield size={14} style={{ color: '#c62828' }} />}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{usuario.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ background: tier.color, color: tier.textColor, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {tier.icon} {tier.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{stats.totalPedidos} pedidos</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de Detalle */}
        {selectedUser && (
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-primary-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem', margin: '0 auto 1rem' }}>
                {(selectedUser.nombre || selectedUser.email || '?').charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary-dark)' }}>{selectedUser.nombre || 'Sin nombre'}</h2>
              <span style={{ background: selectedUser.rol === 'ADMIN' ? '#ffebee' : '#e3f2fd', color: selectedUser.rol === 'ADMIN' ? '#c62828' : '#1565c0', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {selectedUser.rol === 'ADMIN' ? '🛡️ Administrador' : '👤 Cliente'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#fafafa', borderRadius: '6px' }}>
                <Mail size={16} style={{ color: 'var(--color-text-light)' }} />
                <span style={{ fontSize: '0.9rem' }}>{selectedUser.email}</span>
              </div>
              {selectedUser.telefonoPorDefecto && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#fafafa', borderRadius: '6px' }}>
                  <Phone size={16} style={{ color: 'var(--color-text-light)' }} />
                  <span style={{ fontSize: '0.9rem' }}>{selectedUser.telefonoPorDefecto}</span>
                </div>
              )}
              {selectedUser.direccionPorDefecto && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#fafafa', borderRadius: '6px' }}>
                  <MapPin size={16} style={{ color: 'var(--color-text-light)' }} />
                  <span style={{ fontSize: '0.9rem' }}>{selectedUser.direccionPorDefecto}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#fafafa', borderRadius: '6px' }}>
                <Calendar size={16} style={{ color: 'var(--color-text-light)' }} />
                <span style={{ fontSize: '0.9rem' }}>Registrado: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('es-CO') : 'Desconocido'}</span>
              </div>
            </div>

            {/* Stats del usuario */}
            {(() => {
              const stats = getUserStats(selectedUser.id);
              const tier = getTier(stats.totalGastado);
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <Package size={20} style={{ margin: '0 auto 0.3rem', color: 'var(--color-primary)' }} />
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0' }}>{stats.totalPedidos}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: 0 }}>Pedidos</p>
                    </div>
                    <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <DollarSign size={20} style={{ margin: '0 auto 0.3rem', color: '#4caf50' }} />
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0' }}>${stats.totalGastado.toLocaleString()}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: 0 }}>Total Gastado</p>
                    </div>
                  </div>

                  <div style={{ background: tier.color, padding: '0.75rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: tier.textColor }}>{tier.icon} Nivel: {tier.name}</span>
                  </div>
                </>
              );
            })()}

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => toggleRol(selectedUser)}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: selectedUser.rol === 'ADMIN' ? '#ffebee' : '#e8f5e9',
                  color: selectedUser.rol === 'ADMIN' ? '#c62828' : '#2e7d32'
                }}
              >
                {selectedUser.rol === 'ADMIN' ? <><ShieldOff size={16} /> Quitar Admin</> : <><Shield size={16} /> Hacer Admin</>}
              </button>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '0.75rem', textAlign: 'center' }}>
              UID: {selectedUser.firebaseUid}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosAdmin;
