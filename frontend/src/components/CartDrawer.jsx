import useStore from '../store/useStore';
import { X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCountUp from '../utils/useCountUp';
import './CartDrawer.css';

const AnimatedTotal = ({ value }) => {
  const count = useCountUp(value, 500, value > 0);
  return <>{count.toLocaleString()}</>;
};

const CartDrawer = () => {
  const {
    isCartOpen,
    toggleCart,
    carrito,
    removeFromCart,
    updateCartQuantity,
    user,
    cuponesActivos
  } = useStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = carrito.reduce((sum, item) => sum + ((Number(item.precio) || 0) * (Number(item.cantidad) || 0)), 0);
  
  const cuponEnvio = cuponesActivos.find(c => c.id === 'envio');
  const costoEnvio = cuponEnvio ? 0 : 10000;

  const cuponBrownie = cuponesActivos.find(c => c.id === 'brownie');
  const descuentoBrownie = cuponBrownie ? 15000 : 0;
  
  let total = (Number(subtotal) || 0) + (Number(costoEnvio) || 0) - (Number(descuentoBrownie) || 0);
  if (isNaN(total) || total < 0) total = 0;

  const handleCheckout = () => {
    toggleCart(); // Cerrar el carrito
    if (user) {
      navigate('/checkout'); // Si está logueado, va al pago
    } else {
      navigate('/login', { state: { from: { pathname: '/checkout' } } }); // Si no, va al login
    }
  };

  return (
    <div className="cart-overlay" onClick={toggleCart}>
        <div className="cart-drawer glass" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Tu Viaje (Carrito)</h2>
          <button className="cart-close" onClick={toggleCart}><X size={24} /></button>
        </div>

        <div className="cart-items">
          {carrito.length === 0 ? (
            <p className="cart-empty">Aún no has seleccionado nada. ¡Anímate!</p>
          ) : (
            carrito.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.nombre}</h4>
                  <p className="text-secondary font-bold">${item.precio.toLocaleString()} x {item.cantidad}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty">
                    <button
                      className="cart-qty-btn"
                      aria-label={`Restar ${item.nombre}`}
                      onClick={() => updateCartQuantity(item.id, (Number(item.cantidad) || 0) - 1)}
                    >
                      -
                    </button>
                    <span className="cart-qty-value">{item.cantidad}</span>
                    <button
                      className="cart-qty-btn"
                      aria-label={`Sumar ${item.nombre}`}
                      onClick={() => updateCartQuantity(item.id, (Number(item.cantidad) || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.nombre}`}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="cart-footer">
            {cuponesActivos.length > 0 && (
              <div style={{ fontSize: '0.85rem', color: '#4caf50', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                ¡Tienes cupones activos aplicados!
              </div>
            )}
            <div className="cart-total">
              <span>Total Estimado:</span>
              <span className="font-bold text-primary">$<AnimatedTotal value={Number(total) || 0} /></span>
            </div>
            <div className="cart-delay-notice" style={{ background: 'rgba(251, 192, 45, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px dashed var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>!</span>
              </div>
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--color-primary-dark)', lineHeight: '1.4' }}>
                Debido a la <strong>alta demanda</strong>, los pedidos están tomando entre <strong>40 y 60 min</strong>.
              </p>
            </div>

            <button className="btn btn--secondary w-full" data-magnetic="true" data-magnetic-strength="0.12" onClick={handleCheckout}>

              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
