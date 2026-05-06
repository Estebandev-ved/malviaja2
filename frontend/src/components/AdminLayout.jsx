import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, ShieldAlert, Loader2, TrendingUp, Tag, Package, MessageSquare, Activity, Map } from 'lucide-react';
import useStore from '../store/useStore';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authLoading, logout } = useStore();

  // LISTA BLANCA DE ADMINS (UIDs Autorizados)
  const ADMIN_UIDS = ['QHjKOXbmDidS1IyyWBJwrH70YSZ2'];

  // 1. Mientras Firebase está cargando, NO redirigir. Mostrar loading.
  if (authLoading) {
    return (
      <div className="container py-32 text-center">
        <Loader2 size={48} className="animate-spin text-primary" style={{ margin: '0 auto 1rem' }} />
        <p>Verificando permisos...</p>
      </div>
    );
  }

  // 2. Si no hay usuario después de cargar, mostrar acceso denegado con link a login
  if (!user) {
    return (
      <div className="container py-32 text-center">
        <ShieldAlert size={64} style={{ color: '#f44336', margin: '0 auto 1.5rem' }} />
        <h2 className="text-primary font-bold">Debes iniciar sesión</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
          Inicia sesión con tu cuenta de administrador para acceder a esta área.
        </p>
        <button className="btn btn--secondary" onClick={() => navigate('/login')}>Ir a Login</button>
      </div>
    );
  }

  // 3. Si hay usuario pero no es admin, mostrar denegado CON su UID
  const isAdmin = ADMIN_UIDS.includes(user.uid) || user.rol === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="container py-32 text-center">
        <ShieldAlert size={64} style={{ color: '#f44336', margin: '0 auto 1.5rem' }} />
        <h2 className="text-primary font-bold">Acceso Denegado</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
          No tienes permisos suficientes para acceder a esta área.
        </p>
        <p style={{ fontSize: '0.9rem', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '4px', display: 'inline-block', fontFamily: 'monospace' }}>
          Tu UID: <strong>{user.uid}</strong>
        </p>
        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
          Rol actual: {user.rol || 'sin rol'}
        </p>
        <button className="btn btn--secondary mt-8" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Productos', path: '/admin/productos', icon: <ShoppingBag size={20} /> },
    { name: 'Usuarios', path: '/admin/usuarios', icon: <Users size={20} /> },
    { name: 'Reportes', path: '/admin/reportes', icon: <TrendingUp size={20} /> },
    { name: 'Cupones', path: '/admin/cupones', icon: <Tag size={20} /> },
    { name: 'Inventario', path: '/admin/inventario', icon: <Package size={20} /> },
    { name: 'Mensajes', path: '/admin/mensajes', icon: <MessageSquare size={20} /> },
    { name: 'Actividad', path: '/admin/actividad', icon: <Activity size={20} /> },
    { name: 'Mapa Entregas', path: '/admin/mapa', icon: <Map size={20} /> },
    { name: 'Configuración', path: '/admin/config', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <img src="/mascota.png" alt="Logo" className="admin-logo" />
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`admin-nav__link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-nav__link logout-btn" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header__search">
            <input type="text" placeholder="Buscar pedidos, clientes..." className="admin-search-input" />
          </div>
          <div className="admin-header__profile">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span className="admin-avatar">{(user.displayName || 'A').charAt(0)}</span>
            )}
            <span>{user.displayName || 'Administrador'}</span>
          </div>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
