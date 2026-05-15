import { useState, useEffect } from 'react';
import { Save, Bell, Truck, Store, Shield, Globe, CheckCircle2, AlertTriangle, Users, Gift } from 'lucide-react';
import { authFetch } from '../../api';

const Section = ({ title, icon, children }) => (
  <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f4f6f8' }}>
      {icon} {title}
    </h2>
    {children}
  </div>
);

const Field = ({ label, description, children }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{label}</label>
    {description && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '0 0 0.5rem' }}>{description}</p>}
    {children}
  </div>
);

const inputStyle = { width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' };

const Toggle = ({ value, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => onChange(!value)}>
    <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? '#4caf50' : '#ccc', position: 'relative', transition: 'background 0.3s' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: value ? '#2e7d32' : '#999' }}>{label}</span>
  </div>
);

const ConfigAdmin = () => {
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estado de la configuración
  const [config, setConfig] = useState({
    maxUsuarios: 50,
    diasInactividad: 15,
    compraMinima: 15000,
    // Tienda
    storeName: 'Malviaja2',
    storeSlogan: 'Tu Viaje Premium',
    storeEmail: 'contacto@malviaja2.com',
    storePhone: '+57 300 000 0000',
    currency: 'COP',
    // Telegram
    telegramEnabled: true,
    telegramToken: '',
    telegramChatId: '',
    // Envío
    deliveryPricePerKm: 1500,
    deliveryBase: 'Medellín (Alpujarra)',
    deliveryMinFree: 150000,
    deliveryMaxRadius: 50,
    // Seguridad
    ageGateEnabled: true,
    ageGateMinAge: 18,
    maintenanceMode: false,
    // Promo 2x1 lanzamiento
    promo2x1Enabled: false,
    promo2x1MaxUsuarios: 20,
    promo2x1GroupLink: '',
    promo2x1Titulo: 'Lanzamiento 2x1',
    promo2x1Subtitulo: 'Solo para las primeras 20 compras completadas de 20 usuarios unicos',
    promo2x1Terminos: 'Promo 2x1 solo aplica en Brownie Fuerte de $15.000 COP (alta dosis/mayor miligramos).\nEl beneficio es 2 brownies por el precio de 1 (2x1) dentro de esa referencia.\nValido para 1 beneficio por cuenta.\nAplica solo en productos seleccionados de la promo.\nNo acumulable con otros cupones o promociones.\nSolo cuentan pedidos con estado ENTREGADO.\nSujeto a disponibilidad y verificacion de compra.\nEnvio no incluido salvo indicacion expresa.\nFinaliza automaticamente al completar 20 compras en 20 usuarios unicos.',
    promoStartTime: '22:00',
    promoEndTime: '02:00',
    promoTipo: '2X1',
    promoTarget: 'NUEVOS',
    promoValue: 0,
    promoProducts: 'Brownie Fuerte',
    promoMode: 'PROGRAMADA',
    promoDuration: 4
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await authFetch('/api/configuracion');
        if (res.ok) {
          const dbConfig = await res.json();
          setConfig(prev => ({
            ...prev,
            ...dbConfig
          }));
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error("Error al cargar configuración", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const res = await authFetch('/api/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Error al guardar en el servidor");
      }
    } catch (e) {
      console.error(e);
      alert("Error al guardar en el servidor");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Configuración</h1>
        <button 
          onClick={handleSave}
          className="btn btn--primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {saved ? <><CheckCircle2 size={16} /> ¡Guardado!</> : <><Save size={16} /> Guardar Cambios</>}
        </button>
      </div>

      {saved && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <CheckCircle2 size={18} /> Configuración guardada correctamente.
        </div>
      )}

      {/* SECCIÓN: EXCLUSIVIDAD Y MARKETING */}
      <Section title="Club Exclusivo (Reglas)" icon={<Users size={22} style={{ color: '#ff9800' }} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <Field label="Límite Máximo de Usuarios" description="Cantidad máxima de miembros activos permitidos en el club.">
            <input type="number" value={config.maxUsuarios} onChange={e => handleChange('maxUsuarios', Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Días de Tolerancia (Inactividad)" description="Días sin hacer pedidos antes de suspender la cuenta.">
            <input type="number" value={config.diasInactividad} onChange={e => handleChange('diasInactividad', Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Compra Mínima ($)" description="Monto mínimo para mantener privilegios VIP y hacer pedidos.">
            <input type="number" value={config.compraMinima} onChange={e => handleChange('compraMinima', Number(e.target.value))} style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* SECCIÓN: PROMO LANZAMIENTO */}
      <Section title="Promo Lanzamiento 2x1" icon={<Gift size={22} style={{ color: '#fbc02d' }} />}>
        <Field label="Estado de la Promo">
          <Toggle value={config.promo2x1Enabled} onChange={v => handleChange('promo2x1Enabled', v)} label={config.promo2x1Enabled ? 'Activa — Visible para los usuarios' : 'Inactiva — No se muestra en la web'} />
        </Field>
        {config.promo2x1Enabled && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #a5d6a7' }}>
            Activa — Se muestra en la web para todos los usuarios
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <Field label="Máximo de Usuarios" description="Se desactiva automáticamente al llegar a este número de compras completadas en usuarios únicos.">
            <input type="number" value={config.promo2x1MaxUsuarios} onChange={e => handleChange('promo2x1MaxUsuarios', Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Modo de Activación" description="Define si la promo se activa por horario o manualmente.">
            <select value={config.promoMode} onChange={e => handleChange('promoMode', e.target.value)} style={inputStyle}>
              <option value="PROGRAMADA">Programada (Por Horario)</option>
              <option value="MANUAL">Manual (Activa Ahora)</option>
            </select>
          </Field>
          <Field label="Hora Inicio (HH:MM)" description="Hora en que comienza la cuenta regresiva (solo modo Programada).">
            <input type="text" value={config.promoStartTime} onChange={e => handleChange('promoStartTime', e.target.value)} style={inputStyle} placeholder="22:00" />
          </Field>
          <Field label="Duración (Horas)" description="Cuánto tiempo estará activa la promo (solo modo Programada).">
            <input type="number" value={config.promoDuration} onChange={e => handleChange('promoDuration', Number(e.target.value))} style={inputStyle} min="1" max="24" />
          </Field>
          <Field label="Tipo de Promo" description="Lógica a aplicar en el carrito.">
            <select value={config.promoTipo} onChange={e => handleChange('promoTipo', e.target.value)} style={inputStyle}>
              <option value="2X1">2x1 (Brownie Fuerte)</option>
              <option value="PERCENT">Descuento Porcentaje (%)</option>
              <option value="FIXED">Descuento Fijo ($)</option>
            </select>
          </Field>
          <Field label="Público Objetivo" description="A quién aplica la promoción.">
            <select value={config.promoTarget} onChange={e => handleChange('promoTarget', e.target.value)} style={inputStyle}>
              <option value="NUEVOS">Solo Clientes Nuevos</option>
              <option value="TODOS">Todos los Clientes</option>
            </select>
          </Field>
          <Field label="Productos en Promo" description="Nombres separados por coma o 'ALL' para aplicar a todo.">
            <input type="text" value={config.promoProducts} onChange={e => handleChange('promoProducts', e.target.value)} style={inputStyle} placeholder="Brownie Fuerte, Brownie Clasico" />
          </Field>
          {(config.promoTipo === 'PERCENT' || config.promoTipo === 'FIXED') && (
            <Field label="Valor del Descuento" description={config.promoTipo === 'PERCENT' ? 'Porcentaje (0-100)' : 'Monto en pesos ($)'}>
              <input type="number" value={config.promoValue} onChange={e => handleChange('promoValue', Number(e.target.value))} style={inputStyle} />
            </Field>
          )}
          <Field label="Link Grupo U" description="URL del grupo donde se comparte la promo.">
            <input type="url" value={config.promo2x1GroupLink} onChange={e => handleChange('promo2x1GroupLink', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Titulo" description="Encabezado corto para la promo.">
            <input type="text" value={config.promo2x1Titulo} onChange={e => handleChange('promo2x1Titulo', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Subtitulo" description="Frase secundaria visible en el banner.">
            <input type="text" value={config.promo2x1Subtitulo} onChange={e => handleChange('promo2x1Subtitulo', e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <Field label="Condiciones de la promo" description="Cada linea se mostrara como un punto en la web.">
          <textarea value={config.promo2x1Terminos} onChange={e => handleChange('promo2x1Terminos', e.target.value)} style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} />
        </Field>
        <div style={{ background: '#fff8e1', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#8d6e63' }}>
          Se desactiva automaticamente cuando el backend detecta {config.promo2x1MaxUsuarios || 20} compras completadas en usuarios unicos.
        </div>
      </Section>

      {/* SECCIÓN: TIENDA */}
      <Section title="Información de la Tienda" icon={<Store size={22} style={{ color: 'var(--color-primary)' }} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <Field label="Nombre de la Tienda" description="Nombre público de tu negocio.">
            <input type="text" value={config.storeName} onChange={e => handleChange('storeName', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Slogan" description="Frase que acompaña el logo.">
            <input type="text" value={config.storeSlogan} onChange={e => handleChange('storeSlogan', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email de Contacto">
            <input type="email" value={config.storeEmail} onChange={e => handleChange('storeEmail', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Teléfono (WhatsApp)">
            <input type="tel" value={config.storePhone} onChange={e => handleChange('storePhone', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Moneda" description="Moneda utilizada para todos los precios.">
            <select value={config.currency} onChange={e => handleChange('currency', e.target.value)} style={inputStyle}>
              <option value="COP">COP - Peso Colombiano</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="MXN">MXN - Peso Mexicano</option>
            </select>
          </Field>
          <Field label="Pedido Mínimo ($)" description="Monto mínimo para que un cliente pueda realizar un pedido.">
            <input type="number" value={config.minOrder} onChange={e => handleChange('minOrder', Number(e.target.value))} style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* SECCIÓN: TELEGRAM */}
      <Section title="Notificaciones Telegram" icon={<Bell size={22} style={{ color: '#0088cc' }} />}>
        <Field label="Estado de Notificaciones">
          <Toggle value={config.telegramEnabled} onChange={v => handleChange('telegramEnabled', v)} label={config.telegramEnabled ? 'Activo — Recibirás notificaciones en Telegram' : 'Desactivado — No llegarán alertas'} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <Field label="Bot Token" description="Token secreto del bot de Telegram. No compartir.">
            <input type="password" value={config.telegramToken} onChange={e => handleChange('telegramToken', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Chat ID del Admin" description="ID del chat donde se envían las notificaciones de pedidos.">
            <input type="text" value={config.telegramChatId} onChange={e => handleChange('telegramChatId', e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div style={{ background: '#e3f2fd', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#1565c0', marginTop: '0.5rem' }}>
          Nota: Cada pedido nuevo enviara una foto del comprobante con botones interactivos (Aceptar, Preparar, En Camino, Entregado).
        </div>
      </Section>

      {/* SECCIÓN: ENVÍO */}
      <Section title="Logística de Envío" icon={<Truck size={22} style={{ color: '#4caf50' }} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <Field label="Precio por Kilómetro ($)" description="Tarifa que se cobra por km de distancia desde la sede.">
            <input type="number" value={config.deliveryPricePerKm} onChange={e => handleChange('deliveryPricePerKm', Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Sede de Despacho" description="Dirección base desde donde se calculan las rutas.">
            <input type="text" value={config.deliveryBase} onChange={e => handleChange('deliveryBase', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Envío Gratis desde ($)" description="Si el pedido supera este monto, el envío es gratis.">
            <input type="number" value={config.deliveryMinFree} onChange={e => handleChange('deliveryMinFree', Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Radio Máximo de Envío (km)" description="Distancia máxima a la que realizas entregas.">
            <input type="number" value={config.deliveryMaxRadius} onChange={e => handleChange('deliveryMaxRadius', Number(e.target.value))} style={inputStyle} />
          </Field>
        </div>
      </Section>

      {/* SECCIÓN: SEGURIDAD */}
      <Section title="Seguridad y Acceso" icon={<Shield size={22} style={{ color: '#f44336' }} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <Field label="Verificación de Edad (Age Gate)">
            <Toggle value={config.ageGateEnabled} onChange={v => handleChange('ageGateEnabled', v)} label={config.ageGateEnabled ? 'Activado — Se pide la edad al entrar' : 'Desactivado'} />
          </Field>
          <Field label="Edad Mínima">
            <input type="number" value={config.ageGateMinAge} onChange={e => handleChange('ageGateMinAge', Number(e.target.value))} style={inputStyle} />
          </Field>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: config.maintenanceMode ? '#fff3e0' : '#fafafa', borderRadius: '8px', border: config.maintenanceMode ? '2px solid #ff9800' : '1px solid #eee' }}>
          <Field label="Modo Mantenimiento" description="Cuando está activo, los clientes verán un mensaje de 'En Mantenimiento' y no podrán navegar por el sitio.">
            <Toggle value={config.maintenanceMode} onChange={v => handleChange('maintenanceMode', v)} label={config.maintenanceMode ? 'ACTIVO — La tienda esta en mantenimiento' : 'Desactivado — Tienda operando normalmente'} />
          </Field>
          {config.maintenanceMode && (
            <div style={{ background: '#fff9c4', color: '#f57f17', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <AlertTriangle size={16} /> ¡Cuidado! Los clientes no podrán acceder a la tienda mientras este modo esté activo.
            </div>
          )}
        </div>
      </Section>

      {/* SECCIÓN: SEO/WEB */}
      <Section title="Web y SEO" icon={<Globe size={22} style={{ color: '#9c27b0' }} />}>
        <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#6a1b9a' }}>
          <p style={{ margin: 0 }}><strong>Estado del Sistema:</strong></p>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
            <li>Frontend: React + Vite (localhost:5173)</li>
            <li>Backend: Spring Boot 4 (localhost:8080)</li>
            <li>Base de Datos: MySQL (malviaja2_db)</li>
            <li>Autenticación: Firebase Auth (Google)</li>
            <li>Notificaciones: Telegram Bot API</li>
            <li>Rutas: OSRM + Nominatim (Geocoding)</li>
          </ul>
        </div>
      </Section>
    </div>
  );
};

export default ConfigAdmin;
