import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Circle } from 'lucide-react';
import { logActivity } from '../../utils/activityLog';

const KEY = 'admin_mensajes';

const demoConversaciones = [
  {
    id: 1,
    clienteNombre: 'Juan Pérez',
    clienteEmail: 'juan@ejemplo.com',
    mensajes: [
      { de: 'cliente', texto: 'Hola, ¿cuánto se demora el envío a Laureles?', fecha: new Date(Date.now() - 3600000 * 2).toISOString() },
      { de: 'admin', texto: '¡Hola Juan! Normalmente entre 30 y 60 minutos. 🚴', fecha: new Date(Date.now() - 3500000 * 2).toISOString() },
      { de: 'cliente', texto: 'Perfecto, gracias!', fecha: new Date(Date.now() - 3400000 * 2).toISOString() },
    ],
    ultimaMensaje: new Date(Date.now() - 3400000 * 2).toISOString(),
    noLeidos: 0,
  },
  {
    id: 2,
    clienteNombre: 'María García',
    clienteEmail: 'maria@ejemplo.com',
    mensajes: [
      { de: 'cliente', texto: 'Quiero saber si tienen el producto Gelato disponible', fecha: new Date(Date.now() - 1800000).toISOString() },
    ],
    ultimaMensaje: new Date(Date.now() - 1800000).toISOString(),
    noLeidos: 1,
  },
  {
    id: 3,
    clienteNombre: 'Carlos Rodríguez',
    clienteEmail: 'carlos@ejemplo.com',
    mensajes: [
      { de: 'cliente', texto: 'Mi pedido #42 lleva 2 horas, ¿qué pasó?', fecha: new Date(Date.now() - 600000).toISOString() },
    ],
    ultimaMensaje: new Date(Date.now() - 600000).toISOString(),
    noLeidos: 1,
  },
];

const card = {
  background: 'white',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid rgba(0,0,0,0.05)',
  overflow: 'hidden',
};

const Mensajes = () => {
  const [conversaciones, setConversaciones] = useState(() => {
    const guardadas = localStorage.getItem(KEY);
    return guardadas ? JSON.parse(guardadas) : demoConversaciones;
  });
  const [seleccionada, setSeleccionada] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(conversaciones));
  }, [conversaciones]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [seleccionada, conversaciones]);

  const seleccionar = (conv) => {
    setSeleccionada(conv.id);
    setConversaciones(prev =>
      prev.map(c => c.id === conv.id ? { ...c, noLeidos: 0 } : c)
    );
  };

  const enviar = () => {
    if (!respuesta.trim() || !seleccionada) return;
    const mensaje = { de: 'admin', texto: respuesta.trim(), fecha: new Date().toISOString() };
    setConversaciones(prev =>
      prev.map(c =>
        c.id === seleccionada
          ? { ...c, mensajes: [...c.mensajes, mensaje], ultimaMensaje: mensaje.fecha }
          : c
      )
    );
    logActivity('MENSAJE', `Respuesta enviada a conversación #${seleccionada}`);
    setRespuesta('');
  };

  const conv = conversaciones.find(c => c.id === seleccionada);
  const totalNoLeidos = conversaciones.reduce((s, c) => s + (c.noLeidos || 0), 0);

  const tiempoRelativo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(iso).toLocaleDateString('es-CO');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>💬 Centro de Mensajes</h1>
        {totalNoLeidos > 0 && (
          <span style={{ background: '#f44336', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {totalNoLeidos} nuevo{totalNoLeidos > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ ...card, display: 'grid', gridTemplateColumns: '300px 1fr', height: '600px' }}>
        {/* Lista de conversaciones */}
        <div style={{ borderRight: '1px solid #f0f0f0', overflowY: 'auto' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            Conversaciones ({conversaciones.length})
          </div>
          {conversaciones.map(c => (
            <div
              key={c.id}
              onClick={() => seleccionar(c)}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #f8f8f8',
                cursor: 'pointer',
                background: seleccionada === c.id ? 'var(--color-background)' : 'white',
                borderLeft: seleccionada === c.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.clienteNombre}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{tiempoRelativo(c.ultimaMensaje)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {c.mensajes[c.mensajes.length - 1]?.texto}
                </p>
                {c.noLeidos > 0 && (
                  <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0 }}>
                    {c.noLeidos}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Panel de mensajes */}
        {conv ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {conv.clienteNombre.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: '600', margin: 0 }}>{conv.clienteNombre}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>{conv.clienteEmail}</p>
              </div>
              <Circle size={8} style={{ color: '#4caf50', marginLeft: 'auto', fill: '#4caf50' }} />
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {conv.mensajes.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.de === 'admin' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: m.de === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.de === 'admin' ? 'var(--color-primary)' : '#f4f6f8',
                    color: m.de === 'admin' ? 'white' : 'var(--color-text)',
                    fontSize: '0.9rem',
                  }}>
                    <p style={{ margin: 0, marginBottom: '0.3rem' }}>{m.texto}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.7, textAlign: 'right' }}>
                      {new Date(m.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '0.75rem' }}>
              <input
                value={respuesta}
                onChange={e => setRespuesta(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                placeholder="Escribe una respuesta..."
                style={{ flex: 1, padding: '0.7rem 1rem', border: '1px solid #e0e0e0', borderRadius: 'var(--radius-full)', outline: 'none', fontSize: '0.9rem' }}
              />
              <button
                onClick={enviar}
                disabled={!respuesta.trim()}
                style={{ padding: '0.7rem 1.25rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', opacity: !respuesta.trim() ? 0.5 : 1 }}
              >
                <Send size={16} /> Enviar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)', gap: '1rem' }}>
            <MessageSquare size={48} style={{ opacity: 0.3 }} />
            <p>Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mensajes;
