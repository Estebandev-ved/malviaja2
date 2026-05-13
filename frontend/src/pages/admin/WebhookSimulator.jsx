import { useState, useEffect } from 'react';
import { RefreshCw, Activity, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { authFetch } from '../../api';

const WebhookSimulator = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/pedidos/todos');
      if (res.ok) {
        const data = await res.json();
        setPedidos((Array.isArray(data) ? data : data?.content || []).filter(p => p.estado === 'PENDIENTE'));
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const addLog = (msg, type = 'info') => {
    setLog(prev => [{ hora: new Date().toLocaleTimeString(), msg, type }, ...prev]);
  };

  const simularPago = async (pedido) => {
    setProcessingId(pedido.id);
    addLog(`📡 Webhook recibido para pedido #${pedido.id}...`, 'info');

    await new Promise(r => setTimeout(r, 1500));

    const montoEsperado = pedido.total || 0;
    const montoRecibido = montoEsperado;
    const refTransaccion = `NEQUI-${Date.now().toString().slice(-8)}`;

    addLog(`✅ Monto verificado: $${montoRecibido.toLocaleString('es-CO')} (esperado: $${montoEsperado.toLocaleString('es-CO')})`, 'success');
    addLog(`🔗 Referencia: ${refTransaccion}`, 'success');
    addLog(`🔄 Actualizando pedido #${pedido.id} a PAGADO...`, 'info');

    try {
      const res = await authFetch(`/api/pedidos/${pedido.id}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'PAGADO' }),
      });
      if (res.ok) {
        addLog(`✅ Pedido #${pedido.id} aprobado automáticamente vía webhook simulado`, 'success');
        addLog(`🏆 Puntos acreditados al usuario`, 'success');
        setPedidos(prev => prev.filter(p => p.id !== pedido.id));
      } else {
        addLog(`❌ Error al actualizar pedido #${pedido.id}`, 'error');
      }
    } catch (e) {
      addLog(`❌ Error de conexión: ${e.message}`, 'error');
    }
    setProcessingId(null);
  };

  const limpiarLog = () => setLog([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={28} className="text-secondary" /> Webhook Nequi (Simulado)
        </h1>
        <button onClick={fetchPedidos} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Pedidos pendientes */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Pedidos Pendientes ({pedidos.length})</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>Cargando...</div>
          ) : pedidos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
              <CheckCircle2 size={48} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
              <p>No hay pedidos pendientes. ¡Todo al día!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pedidos.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8f9fa', borderRadius: 'var(--radius-md)', border: '1px solid #e0e0e0' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>#{p.id}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>{p.nombreReceptor || 'Sin nombre'}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>${(p.total || 0).toLocaleString('es-CO')}</div>
                  </div>
                  <button onClick={() => simularPago(p)} disabled={processingId === p.id} style={{ border: 'none', background: processingId === p.id ? '#e0e0e0' : '#4caf50', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: processingId === p.id ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    {processingId === p.id ? 'Procesando...' : 'Simular Pago'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log de eventos */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--color-primary-dark)', margin: 0 }}>📋 Log de Eventos</h3>
            {log.length > 0 && (
              <button onClick={limpiarLog} style={{ border: '1px solid #ddd', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Limpiar</button>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {log.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                <Activity size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                <p>Simula un pago para ver el log aquí</p>
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.82rem', padding: '0.5rem', background: entry.type === 'error' ? '#fff5f5' : entry.type === 'success' ? '#f1f8e9' : '#f5f5f5', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: '#999', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.72rem' }}>{entry.hora}</span>
                  <span style={{ color: entry.type === 'error' ? '#c62828' : entry.type === 'success' ? '#2e7d32' : 'var(--color-text)' }}>{entry.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h4 style={{ color: '#e65100', marginBottom: '0.5rem' }}>⚡ ¿Cómo funciona?</h4>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
          Este simulador emula el webhook de <strong>Nequi Empresas</strong>. En producción, cuando un cliente paga, Nequi envía automáticamente una notificación a nuestro servidor confirmando el pago.
          Al hacer clic en "Simular Pago", el sistema:<br /><br />
          1️⃣ Recibe el webhook simulado con los datos de la transacción<br />
          2️⃣ Verifica que el monto coincida con el pedido<br />
          3️⃣ Actualiza automáticamente el estado a PAGADO<br />
          4️⃣ Acredita los puntos de fidelidad al usuario<br /><br />
          <strong>Para producción real:</strong> Configura un webhook en tu cuenta de Nequi Negocios apuntando a <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>POST /api/webhook/nequi</code>
        </p>
      </div>
    </div>
  );
};

export default WebhookSimulator;
