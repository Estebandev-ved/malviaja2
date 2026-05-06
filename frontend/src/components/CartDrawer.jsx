import useStore from '../store/useStore';
import { X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

const CartDrawer = () => {
  const { isCartOpen, toggleCart, carrito, removeFromCart, user, cuponesActivos } = useStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  const cuponEnvio = cuponesActivos.find(c => c.id === 'envio');
  const costoEnvio = cuponEnvio ? 0 : 10000;

  const cuponBrownie = cuponesActivos.find(c => c.id === 'brownie');
  const descuentoBrownie = cuponBrownie ? 15000 : 0;
  
  let total = subtotal + costoEnvio - descuentoBrownie;
  if (total < 0) total = 0;

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
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={20} />
                </button>
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
              <span className="font-bold text-primary">${total.toLocaleString()}</span>
            </div>
            <button className="btn btn--secondary w-full" onClick={handleCheckout}>
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
