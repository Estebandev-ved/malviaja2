import React, { useState } from 'react';
import { MapPin, Navigation, DollarSign, Activity, Search, Loader2 } from 'lucide-react';

const DeliveryCalculator = () => {
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados Flexibles (Ajustables por el Admin)
  const [valorKm, setValorKm] = useState(1500);
  const [origin, setOrigin] = useState({ lat: 6.2442, lon: -75.5812, name: 'Medellín (Alpujarra)' });
  const [newOriginAddr, setNewOriginAddr] = useState('');

  const calculateDistance = async () => {
    if (!address) return;
    setLoading(true);
    setError('');
    
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) throw new Error('No pudimos encontrar esa dirección.');

      const dest = { lat: geoData[0].lat, lon: geoData[0].lon };
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false`);
      const routeData = await routeRes.json();
      if (routeData.code !== 'Ok') throw new Error('No se pudo calcular la ruta.');

      const distInKm = routeData.routes[0].distance / 1000;
      setDistance(distInKm);
    } catch (err) {
      setError(err.message);
      setDistance(null);
    } finally {
      setLoading(false);
    }
  };

  const updateOrigin = async () => {
    if (!newOriginAddr) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newOriginAddr)}`);
      const data = await res.json();
      if (data.length > 0) {
        setOrigin({ lat: data[0].lat, lon: data[0].lon, name: newOriginAddr });
        setNewOriginAddr('');
        alert("Sede de despacho actualizada correctamente.");
      }
    } catch (e) {
      alert("Error al buscar la nueva sede.");
    }
  };

  const total = distance ? Math.round(distance * valorKm) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECCIÓN DE AJUSTES (SOLO ADMIN) */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.05)', background: '#fcfcfc' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚙️ Ajustes de Logística
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Precio por Kilómetro ($)</label>
            <input 
              type="number" 
              value={valorKm} 
              onChange={e => setValorKm(Number(e.target.value))}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Cambiar Ubicación de Sede</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Nueva dirección de sede..." 
                value={newOriginAddr}
                onChange={e => setNewOriginAddr(e.target.value)}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
              />
              <button onClick={updateOrigin} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary-dark)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                Fijar Sede
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CALCULADORA DE RUTA */}
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--color-primary-dark)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'white' }}>
            <Navigation size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-primary-dark)' }}>Ruta Inteligente Malviaja2</h2>
            <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Basado en sede actual: <strong>{origin.name}</strong></p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Punto de Despacho (Sede Base)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', background: '#f0f2f5', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '0.9rem' }}>
                <MapPin size={16} />
                <span>{origin.name}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Simular Dirección de Cliente</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && calculateDistance()}
                    placeholder="Ej: El Poblado, Envigado..."
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc', fontSize: '1rem' }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                </div>
                <button 
                  onClick={calculateDistance}
                  disabled={loading}
                  style={{ background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', border: 'none', padding: '0 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Calcular'}
                </button>
              </div>
              {error && <p style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, #1a1a1a 100%)', color: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Activity size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <span>Distancia Real:</span>
                <span className="font-bold">{distance ? `${distance.toFixed(2)} km` : '--'}</span>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>COSTO A COBRAR (${valorKm}/km)</span>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-secondary)', textShadow: '0 2px 10px rgba(255,255,0,0.2)' }}>
                  ${total.toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', textAlign: 'center' }}>
                Tarifa Ajustable Malviaja2 Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryCalculator;
