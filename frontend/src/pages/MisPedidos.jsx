import React, { useEffect, useState } from 'react';
import { Package, ChefHat, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import { authFetch } from '../api';
import './MisPedidos.css';

const MisPedidos = ({ isEmbedded = false }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useStore(state => state.user);

  useEffect(() => {
    if (user) {
      fetchPedidos();
    }
  }, [user]);

  const fetchPedidos = async () => {
    try {
      const response = await authFetch(`/api/pedidos/usuario/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return <Package size={24} color="var(--color-primary)" />;
      case 'PAGADO': return <CheckCircle size={24} color="#1b5e20" />;
      case 'REVISION_MANUAL': return <Clock size={24} color="#6a1b9a" />;
      case 'PREPARANDO': return <ChefHat size={24} color="#f9a825" />;
      case 'EN_CAMINO': return <Truck size={24} color="#f57c00" />;
      case 'ENTREGADO': return <CheckCircle size={24} color="#388e3c" />;
      case 'CANCELADO': return <XCircle size={24} color="#d32f2f" />;
      default: return <Package size={24} color="#9e9e9e" />;
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return "Orden Recibida";
      case 'PAGADO': return "Pago verificado";
      case 'REVISION_MANUAL': return "Revisión manual";
      case 'PREPARANDO': return "Preparando tu viaje";
      case 'EN_CAMINO': return "En Repartición";
      case 'ENTREGADO': return "Entregado";
      case 'CANCELADO': return "Cancelado";
      default: return estado;
    }
  };

  const renderTimeline = (estado) => {
    const states = ['PENDIENTE', 'PAGADO', 'REVISION_MANUAL', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO'];
    const currentIndex = states.indexOf(estado);
    
    if (estado === 'CANCELADO') {
      return (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#d32f2f', fontWeight: 'bold' }}>
          <XCircle size={24} />
          Este pedido fue cancelado.
        </div>
      );
    }

    return (
      <div className="timeline-container">
        <div className="timeline-track"></div>
        <div 
          className="timeline-progress"
          style={{ width: `${(currentIndex / (states.length - 1)) * 100}%` }}
        ></div>
        
        {states.map((st, index) => (
          <div key={st} className="timeline-step">
            <div className={`timeline-icon ${index <= currentIndex ? 'active' : ''}`}>
              {index === 0 && <Package size={20} />}
              {index === 1 && <ChefHat size={20} />}
              {index === 2 && <Truck size={20} />}
              {index === 3 && <CheckCircle size={20} />}
            </div>
            <span className={`timeline-label ${index <= currentIndex ? 'active' : ''}`}>
              {getStatusText(st)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-primary-dark font-bold">Inicia sesión para ver tus pedidos</h2>
      </div>
    );
  }

  const content = (
    <>
      {!isEmbedded && <h1 className="text-primary-dark font-bold text-center" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Mis Viajes</h1>}
      {isEmbedded && <h2 className="text-primary-dark font-bold" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={28} className="text-primary" /> Historial de Viajes</h2>}
      
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Cargando tus viajes...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-primary-light)' }}>
          <Package size={64} color="var(--color-primary-light)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-primary-dark font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Aún no tienes pedidos</h3>
          <p style={{ color: 'var(--color-text-light)' }}>¡Es hora de armar tu primer viaje!</p>
        </div>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido, idx) => (
            <div key={pedido.id} className={`pedido-card ${idx === 0 ? 'highlight' : ''}`}>
              <div className="pedido-header">
                <div>
                  <h3 className="text-primary-dark font-bold" style={{ fontSize: '1.2rem' }}>Orden #{pedido.id}</h3>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    {new Date(pedido.fechaPedido).toLocaleDateString()} - {new Date(pedido.fechaPedido).toLocaleTimeString()}
                  </p>
                </div>
                <div className="pedido-status-badge">
                  {getStatusIcon(pedido.estado)}
                  <span>{getStatusText(pedido.estado)}</span>
                </div>
              </div>

              {/* Mostrar el rastreador en vivo para el pedido más reciente (si no está entregado o cancelado) */}
              {idx === 0 && renderTimeline(pedido.estado)}

              <div className="pedido-details">
                <h4 className="font-bold text-primary" style={{ marginBottom: '1rem' }}>Detalle de la compra:</h4>
                <div style={{ marginBottom: '1.5rem' }}>
                  {pedido.carritoJson ? (() => {
                    // BUG FIX: JSON.parse sin try/catch crashea toda la página si carritoJson
                    // está corrupto en BD. Ahora falla de forma controlada por ítem.
                    try {
                      return JSON.parse(pedido.carritoJson).map((item, i) => (
                        <div key={i} className="pedido-item-row">
                          <span>{item.cantidad}x {item.nombre} {item.dosisMg ? `(${item.dosisMg}mg)` : ''}</span>
                          <span style={{ fontWeight: '600' }}>${(item.precio * item.cantidad).toLocaleString()}</span>
                        </div>
                      ));
                    } catch (e) {
                      return <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Detalle no disponible</span>;
                    }
                  })() : <span style={{ color: 'var(--color-text-light)' }}>Productos no detallados</span>}
                </div>
                
                <div className="pedido-total-row">
                  <span>Total Pagado:</span>
                  <span style={{ color: 'var(--color-primary)' }}>${pedido.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="container py-16">
      {content}
    </div>
  );
};

export default MisPedidos;
