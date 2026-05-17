import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Loader2, RefreshCw, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { authFetch } from '../../api';

const RadarClientes = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/usuarios/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.warn("Error cargando leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleSendRecoveryEmail = async (usuarioId) => {
    setSendingEmail(usuarioId);
    try {
      const res = await authFetch(`/api/usuarios/leads/${usuarioId}/recuperar`, {
        method: 'POST'
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === usuarioId ? { ...l, recoveryEmailSent: true } : l));
      } else {
        const err = await res.json();
        alert(err.error || "Error al enviar el correo.");
      }
    } catch (e) {
      alert("Error de conexión al enviar el correo.");
    } finally {
      setSendingEmail(null);
    }
  };

  const getWhatsAppLink = (nombre, telefono) => {
    const cleanPhone = (telefono || '').replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${nombre || 'amigo'}, soy de Malviaja2. Tenemos un regalo sorpresa para ti si completas tu pedido hoy.`);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Radar de Clientes</h1>
          <p style={{ color: 'var(--color-text-light)', margin: '0.5rem 0 0' }}>Contacta a usuarios registrados que aún no han probado el viaje.</p>
        </div>
        <button onClick={fetchLeads} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #ddd', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#fff9c4', color: '#f57f17', padding: '0.8rem', borderRadius: '12px' }}><Users size={24} /></div>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>Leads por Recuperar</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{leads.length}</p>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.8rem', borderRadius: '12px' }}><CheckCircle2 size={24} /></div>
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0 }}>Correos Enviados</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{leads.filter(l => l.recoveryEmailSent).length}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Leads */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>Usuario</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>Registro</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', textAlign: 'center' }}>Acciones de Recuperación</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ padding: '4rem', textAlign: 'center' }}>
                  <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-light)' }}>Buscando leads...</p>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  ¡Increíble! Todos tus usuarios registrados ya han realizado compras.
                </td>
              </tr>
            ) : (
              leads.map(usuario => (
                <tr key={usuario.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{usuario.nombre || 'Sin nombre'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Mail size={14} /> {usuario.email}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="var(--color-text-light)" />
                      {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                      {/* Botón Email */}
                      <button
                        onClick={() => handleSendRecoveryEmail(usuario.id)}
                        disabled={usuario.recoveryEmailSent || sendingEmail === usuario.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 1.2rem',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          cursor: usuario.recoveryEmailSent ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          background: usuario.recoveryEmailSent ? '#e8f5e9' : 'var(--color-primary)',
                          color: usuario.recoveryEmailSent ? '#2e7d32' : 'white',
                          boxShadow: usuario.recoveryEmailSent ? 'none' : '0 4px 12px rgba(106, 27, 154, 0.2)'
                        }}
                      >
                        {sendingEmail === usuario.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : usuario.recoveryEmailSent ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Send size={16} />
                        )}
                        {usuario.recoveryEmailSent ? 'Enviado' : 'Enviar Regalo'}
                      </button>

                      {/* Botón WhatsApp */}
                      {usuario.telefonoPorDefecto && (
                        <a
                          href={getWhatsAppLink(usuario.nombre, usuario.telefonoPorDefecto)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            background: '#25D366',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)'
                          }}
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RadarClientes;
