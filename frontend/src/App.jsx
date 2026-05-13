import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/* Global Overlays */
import AgeGate from './components/AgeGate';

/* Client Components */
import Layout from './components/Layout';
import Home from './pages/Home';
import Comestibles from './pages/Comestibles';
import QuienesSomos from './pages/QuienesSomos';
import Terminos from './pages/Terminos';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Quiz from './pages/Quiz';
import Perfil from './pages/Perfil';
import SeguimientoPedido from './pages/SeguimientoPedido';
/* Admin Components */
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductosAdmin from './pages/admin/Productos';
import UsuariosAdmin from './pages/admin/Usuarios';
import ConfigAdmin from './pages/admin/Config';
import Reportes from './pages/admin/Reportes';
import Cupones from './pages/admin/Cupones';
import Inventario from './pages/admin/Inventario';
import Mensajes from './pages/admin/Mensajes';
import Actividad from './pages/admin/Actividad';
import MapaEntregas from './pages/admin/MapaEntregas';
import AceptarPedidos from './pages/admin/AceptarPedidos';
import WebhookSimulator from './pages/admin/WebhookSimulator';
import NoticiasAdmin from './pages/admin/Noticias';
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <Router>
      <CustomCursor />
      <AgeGate />
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="comestibles" element={<Comestibles />} />
          <Route path="quienes-somos" element={<QuienesSomos />} />
          <Route path="terminos" element={<Terminos />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="pedido/:ref" element={<SeguimientoPedido />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<ProductosAdmin />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="config" element={<ConfigAdmin />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="cupones" element={<Cupones />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="mensajes" element={<Mensajes />} />
          <Route path="actividad" element={<Actividad />} />
          <Route path="mapa" element={<MapaEntregas />} />
          <Route path="aceptar-pedidos" element={<AceptarPedidos />} />
          <Route path="webhook" element={<WebhookSimulator />} />
          <Route path="noticias" element={<NoticiasAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
