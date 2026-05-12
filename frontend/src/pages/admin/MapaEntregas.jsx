import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Navigation, Package, Truck, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { authFetch } from '../../api';

// Fix leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Colores por estado
const ESTADO_COLOR = {
  PENDIENTE: '#ff9800',
  ACEPTADO: '#2196f3',
  PREPARANDO: '#f57f17',
  EN_CAMINO: '#4caf50',
  ENTREGADO: '#9e9e9e',
  CANCELADO: '#f44336',
};

const ESTADO_ICON = {
  PENDIENTE: '🕐',
  ACEPTADO: '✅',
  PREPARANDO: '🍳',
  EN_CAMINO: '🚴',
  ENTREGADO: '📦',
  CANCELADO: '❌',
};

// Crea icono de marcador con color
const crearIcono = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

const hubIcono = L.divIcon({
  className: '',
  html: `<div style="
    width: 34px; height: 34px;
    background: #7c3aed;
    border: 3px solid white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  ">🏠</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Medellín: zonas aproximadas para demo (coordenadas reales por barrio)
const COORDS_DEMO = [
  [6.2442, -75.5812], [6.2518, -75.5636], [6.2350, -75.5741],
  [6.2626, -75.5717], [6.2195, -75.5780], [6.2680, -75.5580],
  [6.2302, -75.5640], [6.2710, -75.5731], [6.2458, -75.5511],
  [6.2137, -75.5853], [6.2573, -75.5845], [6.2389, -75.5702],
];

// Hub de despacho (Alpujarra, Medellín)
const HUB = [6.2442, -75.5812];

const card = {
  background: 'white',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
};

const FitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.coords));
      bounds.extend(HUB);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, map]);
  return null;
};

const MapaEntregas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('ACTIVOS');
  const [seleccionado, setSeleccionado] = useState(null);

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

  const estadosActivos = ['PENDIENTE', 'ACEPTADO', 'PREPARANDO', 'EN_CAMINO'];

  const pedidosFiltrados = pedidos.filter(p =>
    filtroEstado === 'TODOS'
      ? true
      : filtroEstado === 'ACTIVOS'
      ? estadosActivos.includes(p.estado)
      : p.estado === filtroEstado
  );

  // Asigna coordenadas demo a los pedidos (en prod vendrían de geocodificación)
  const markersConCoords = pedidosFiltrados.map((p, i) => ({
    ...p,
    coords: COORDS_DEMO[i % COORDS_DEMO.length],
  }));

  const contadores = {};
  pedidos.forEach(p => { contadores[p.estado] = (contadores[p.estado] || 0) + 1; });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>🗺️ Mapa de Entregas en Vivo</h1>
        <button onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { estado: 'PENDIENTE', label: 'Pendientes', icon: <Clock size={18} /> },
          { estado: 'EN_CAMINO', label: 'En Camino', icon: <Truck size={18} /> },
          { estado: 'PREPARANDO', label: 'Preparando', icon: <Package size={18} /> },
          { estado: 'ENTREGADO', label: 'Entregados', icon: <Navigation size={18} /> },
        ].map(k => (
          <div key={k.estado} style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', outline: filtroEstado === k.estado ? `2px solid ${ESTADO_COLOR[k.estado]}` : 'none' }} onClick={() => setFiltroEstado(filtroEstado === k.estado ? 'ACTIVOS' : k.estado)}>
            <div style={{ color: ESTADO_COLOR[k.estado], background: `${ESTADO_COLOR[k.estado]}18`, padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>{k.icon}</div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: 0 }}>{k.label}</p>
              <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>{contadores[k.estado] || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['ACTIVOS', 'TODOS', ...Object.keys(ESTADO_COLOR)].map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)} style={{ padding: '0.3rem 0.75rem', border: `1px solid ${ESTADO_COLOR[e] || '#ddd'}`, borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: filtroEstado === e ? 'bold' : 'normal', background: filtroEstado === e ? (ESTADO_COLOR[e] || 'var(--color-primary)') : 'white', color: filtroEstado === e ? 'white' : 'var(--color-text)' }}>
            {ESTADO_ICON[e] || ''} {e}
          </button>
        ))}
      </div>

      {/* Mapa + Lista */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', height: '520px' }}>
        {/* Mapa */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <MapContainer center={HUB} zoom={13} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Hub de despacho */}
            <Marker position={HUB} icon={hubIcono}>
              <Popup>
                <strong>🏠 Hub de Despacho</strong><br />
                Alpujarra, Medellín<br />
                <small style={{ color: '#666' }}>6.2442°N, 75.5812°W</small>
              </Popup>
            </Marker>

            {/* Pedidos */}
            {markersConCoords.map(p => (
              <Marker
                key={p.id}
                position={p.coords}
                icon={crearIcono(ESTADO_COLOR[p.estado] || '#9e9e9e')}
                eventHandlers={{ click: () => setSeleccionado(p.id) }}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <strong>Pedido #{p.id}</strong><br />
                    <span style={{ color: ESTADO_COLOR[p.estado], fontWeight: 'bold' }}>
                      {ESTADO_ICON[p.estado]} {p.estado}
                    </span><br />
                    👤 {p.nombreReceptor || 'Sin nombre'}<br />
                    📍 {p.direccionEnvio || 'Sin dirección'}<br />
                    💰 ${(p.total || 0).toLocaleString('es-CO')}<br />
                    <small style={{ color: '#999' }}>{p.fechaPedido ? new Date(p.fechaPedido).toLocaleString('es-CO') : ''}</small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {markersConCoords.length > 0 && <FitBounds markers={markersConCoords} />}
          </MapContainer>
        </div>

        {/* Lista lateral */}
        <div style={{ ...card, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text-light)', flexShrink: 0 }}>
            {pedidosFiltrados.length} entrega{pedidosFiltrados.length !== 1 ? 's' : ''}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {pedidosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                <MapPin size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem' }}>Sin entregas para este filtro</p>
              </div>
            ) : (
              pedidosFiltrados.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSeleccionado(seleccionado === p.id ? null : p.id)}
                  style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f8f8f8', cursor: 'pointer', background: seleccionado === p.id ? '#f8f0ff' : 'white', borderLeft: seleccionado === p.id ? '3px solid var(--color-primary)' : '3px solid transparent', transition: 'all 0.15s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>#{p.id} — {p.nombreReceptor || 'Sin nombre'}</span>
                    <span style={{ fontSize: '0.78rem', color: ESTADO_COLOR[p.estado], fontWeight: 'bold' }}>
                      {ESTADO_ICON[p.estado]} {p.estado}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {p.direccionEnvio || 'Sin dirección'}
                  </p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '0.2rem 0 0', color: 'var(--color-primary-dark)' }}>
                    ${(p.total || 0).toLocaleString('es-CO')}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Leyenda */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Leyenda:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {Object.entries(ESTADO_COLOR).map(([e, c]) => (
                <span key={e} style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '10px', height: '10px', background: c, borderRadius: '50%', flexShrink: 0 }} />
                  {ESTADO_ICON[e]}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#bbb', marginTop: '0.5rem', margin: 0 }}>
              * Coordenadas aproximadas. Integra geocodificación en producción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaEntregas;
