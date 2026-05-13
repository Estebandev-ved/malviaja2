import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ChefHat, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiFetch } from '../api';

const ESTADOS = ['PENDIENTE', 'PAGADO', 'REVISION_MANUAL', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO'];

const STATUS_MAP = {
  PENDIENTE: { icon: Package, label: 'Orden Recibida', color: '#e65100', bg: '#fff3e0' },
  PAGADO: { icon: CheckCircle, label: 'Pago Verificado', color: '#1b5e20', bg: '#e8f5e9' },
  REVISION_MANUAL: { icon: Clock, label: 'Revisión Manual', color: '#6a1b9a', bg: '#f3e5f5' },
  PREPARANDO: { icon: ChefHat, label: 'Preparando tu Viaje', color: '#f57f17', bg: '#fff9c4' },
  EN_CAMINO: { icon: Truck, label: 'En Repartición', color: '#2e7d32', bg: '#e8f5e9' },
  ENTREGADO: { icon: CheckCircle, label: 'Entregado', color: '#1b5e20', bg: '#c8e6c9' },
  CANCELADO: { icon: XCircle, label: 'Cancelado', color: '#c62828', bg: '#ffebee' },
};

const SeguimientoPedido = () => {
  const { ref } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await apiFetch(`/api/pedidos/referencia/${ref}`);
        if (res.ok) {
          const data = await res.json();
          setPedido(data);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchPedido();
  }, [ref]);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div style={{ padding: '3rem' }}>
          <div className="skeleton-block" style={{ width: '200px', height: '20px', margin: '0 auto 1rem' }} />
          <div className="skeleton-block" style={{ width: '300px', height: '40px', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="container py-16 text-center">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <XCircle size={64} color="#c62828" style={{ marginBottom: '1rem' }} />
          <h2>Pedido no encontrado</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
            No encontramos un pedido con la referencia <strong>{ref}</strong>.
          </p>
          <Link to="/" className="btn btn--primary">Volver al Inicio</Link>
        </div>
      </div>
    );
  }

  const currentIdx = ESTADOS.indexOf(pedido.estado);
  const isCancelled = pedido.estado === 'CANCELADO';
  const statusInfo = STATUS_MAP[pedido.estado] || STATUS_MAP.PENDIENTE;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container py-16">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <StatusIcon size={64} color={statusInfo.color} style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
            Pedido {pedido.referencia || `#${pedido.id}`}
          </h1>
          <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: '0.4rem 1.2rem', borderRadius: '999px', fontWeight: 'bold', fontSize: '1rem' }}>
            {statusInfo.label}
          </span>
        </div>

        {!isCancelled && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ position: 'relative', margin: '2rem 0', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: '#e0e0e0', borderRadius: '2px', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '24px', left: '10%', height: '4px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '2px', zIndex: 1, width: `${currentIdx >= 0 ? (currentIdx / (ESTADOS.length - 1)) * 100 : 0}%`, transition: 'width 0.8s ease' }} />
              {ESTADOS.filter(s => s !== 'REVISION_MANUAL').map((st, i) => {
                const idx = ESTADOS.indexOf(st);
                const isActive = idx <= currentIdx;
                const info = STATUS_MAP[st];
                const Icon = info.icon;
                return (
                  <div key={st} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isActive ? 'var(--color-primary)' : 'white', border: `2px solid ${isActive ? 'var(--color-primary)' : '#e0e0e0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'white' : '#9e9e9e', transition: 'all 0.3s' }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? 'var(--color-primary-dark)' : '#9e9e9e', textAlign: 'center' }}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ color: '#c62828', marginBottom: '0.5rem' }}>Pedido Cancelado</h3>
            <p style={{ color: '#666' }}>{pedido.motivoCancelacion || 'No se especificó motivo.'}</p>
          </div>
        )}

        {/* Resumen del pedido */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Detalle del Pedido</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-light)' }}>Referencia</span>
              <span style={{ fontWeight: 'bold' }}>{pedido.referencia || `#${pedido.id}`}</span>
            </div>
            {pedido.nombreReceptor && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Cliente</span>
                <span>{pedido.nombreReceptor}</span>
              </div>
            )}
            {pedido.direccionEnvio && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Dirección</span>
                <span>{pedido.direccionEnvio}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-light)' }}>Total</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)' }}>${(pedido.total || 0).toLocaleString('es-CO')}</span>
            </div>
            {pedido.fechaPedido && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Fecha</span>
                <span>{new Date(pedido.fechaPedido).toLocaleString('es-CO')}</span>
              </div>
            )}
          </div>

          {pedido.carritoJson && (() => {
            try {
              const items = JSON.parse(pedido.carritoJson);
              return (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>Productos</h4>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span style={{ fontWeight: 600 }}>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              );
            } catch { return null; }
          })()}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
            Compartí esta página con quien quieras para que vean el estado de tu pedido.
          </p>
          <button className="btn btn--primary" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Enlace copiado al portapapeles'); }}>
            Copiar enlace de seguimiento
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPedido;
