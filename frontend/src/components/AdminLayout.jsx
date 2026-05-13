import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, ShieldAlert, Loader2, TrendingUp, Tag, Package, MessageSquare, Activity, Map, ClipboardCheck, Menu, X } from 'lucide-react';
import useStore from '../store/useStore';
import { useState } from 'react';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authLoading, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // 2. Si no hay usuario después de cargar, redirigir a Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si hay usuario pero no es admin, redirigir a Home
  const isAdmin = ADMIN_UIDS.includes(user.uid) || user.rol === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
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
    { name: 'Aceptar Pedidos', path: '/admin/aceptar-pedidos', icon: <ClipboardCheck size={20} /> },
    { name: 'Noticias', path: '/admin/noticias', icon: <MessageSquare size={20} /> },
    { name: 'Webhook Nequi', path: '/admin/webhook', icon: <Activity size={20} /> },
    { name: 'Configuración', path: '/admin/config', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="admin-header__search">
              <input type="text" placeholder="Buscar pedidos, clientes..." className="admin-search-input" />
            </div>
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
