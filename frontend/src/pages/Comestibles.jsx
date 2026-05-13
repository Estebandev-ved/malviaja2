import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';
import useStore from '../store/useStore';
import { apiFetch } from '../api';
import ProductReviews from '../components/ProductReviews';

const flyToCart = (event, product) => {
  const btn = event.currentTarget;
  const btnRect = btn.getBoundingClientRect();
  const target = document.getElementById('cart-fly-target');
  if (!target) return;
  const targetRect = target.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.textContent = `$${(product.precio || 0).toLocaleString()}`;
  Object.assign(flyer.style, {
    position: 'fixed', zIndex: '9999', width: '56px', height: '56px',
    borderRadius: '50%', background: '#fbc02d', color: '#3e2723',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '0.7rem', pointerEvents: 'none',
    boxShadow: '0 4px 20px rgba(251,192,45,0.5)',
    left: `${btnRect.left + btnRect.width / 2 - 28}px`,
    top: `${btnRect.top + btnRect.height / 2 - 28}px`,
  });

  document.body.appendChild(flyer);

  const dx = targetRect.left + targetRect.width / 2 - (btnRect.left + btnRect.width / 2);
  const dy = targetRect.top + targetRect.height / 2 - (btnRect.top + btnRect.height / 2);

  const anim = flyer.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.4}px, ${dy * 0.6}px) scale(0.7)`, opacity: 0.8, offset: 0.4 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 },
  ], { duration: 700, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' });

  anim.onfinish = () => flyer.remove();
};

const Comestibles = () => {
  const { productos, fetchProductos, loading, addToCart, toggleCart } = useStore();
  const [resenasData, setResenasData] = useState({});
  const [reviewProducto, setReviewProducto] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  useEffect(() => {
    if (!productos.length) return;
    productos.forEach(prod => {
      apiFetch(`/api/productos/${prod.id}/resenas/resumen`).then(r => r.ok && r.json()).then(d => {
        if (d) setResenasData(prev => ({ ...prev, [prod.id]: d }));
      }).catch(() => {});
    });
  }, [productos]);

  const handleAdd = (prod, e) => {
    flyToCart(e, prod);
    setTimeout(() => addToCart(prod), 350);
    setTimeout(() => toggleCart(), 700);
  };

  const renderStars = (rating) => (
    <div style={{ display: 'inline-flex', gap: '1px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} fill={s <= Math.round(rating) ? '#fbc02d' : 'none'} color={s <= Math.round(rating) ? '#fbc02d' : '#e0e0e0'} />
      ))}
    </div>
  );

  return (
    <div className="container py-16">
      <h1 className="section-title text-center" data-reveal>Nuestro Catálogo</h1>
      <p className="text-center text-primary" data-reveal style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Selecciona tu compañero de viaje. Recuerda consumir con responsabilidad y esperar al menos 45 minutos para sentir los efectos.
      </p>

      {loading ? (
        <div className="catalog-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-card" aria-hidden="true">
              <div className="skeleton-block skeleton-image" />
              <div className="skeleton-block skeleton-title" />
              <div className="skeleton-block skeleton-line" />
              <div className="skeleton-block skeleton-line short" />
              <div className="skeleton-block skeleton-button" />
            </div>
          ))}
        </div>
      ) : (
        <div className="catalog-grid" data-stagger="true" data-reveal>
          {/* Tarjeta del Brownie Personalizado */}
          <div className="feature-card glass" data-reveal style={{ textAlign: 'left', border: '2px solid var(--color-secondary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.25rem 1rem', fontWeight: 'bold', fontSize: '0.8rem', borderBottomLeftRadius: '8px' }}>NUEVO</div>
            <div className="product-image" style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-md)', marginBottom: '1rem', overflow: 'hidden' }}>
              <img src="/mascota-nobg.png" alt="A tu Medida" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
            <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>A tu Medida</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>Responde un breve test y crearemos la dosis y receta perfecta para tu nivel de experiencia.</p>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <span className="font-bold text-secondary" style={{ fontSize: '1.25rem' }}>Variable</span>
              <span style={{ fontSize: '0.85rem', background: '#e8f5e9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#2e7d32', fontWeight: 'bold' }}>Personalizado</span>
            </div>
            <Link to="/quiz" className="btn btn--secondary w-full" style={{ display: 'block', textAlign: 'center' }}>
              Hacer el Test
            </Link>
          </div>

          {productos.map(prod => (
            <div key={prod.id} className="feature-card glass" data-reveal style={{ textAlign: 'left' }}>
              <div className="product-image" style={{ aspectRatio: '4/3', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', backgroundImage: prod.imageUrl ? `url(${prod.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{prod.nombre}</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>{prod.descripcion}</p>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <span className="font-bold text-secondary" style={{ fontSize: '1.25rem' }}>${prod.precio.toLocaleString()}</span>
                <span style={{ fontSize: '0.85rem', background: '#ffe0b2', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#e65100', fontWeight: 'bold' }}>
                  Dosis: {prod.dosis}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {renderStars(resenasData[prod.id]?.promedio || 0)}
                  <span style={{ fontSize: '0.75rem', color: '#999' }}>
                    {resenasData[prod.id]?.total || 0}
                  </span>
                </div>
                <button onClick={() => setReviewProducto(prod)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  <MessageSquare size={14} /> Reseñas
                </button>
              </div>
              <button className="btn btn--primary w-full" data-magnetic="true" data-magnetic-strength="0.12" onClick={(e) => handleAdd(prod, e)}>
                Añadir al Carrito
              </button>
            </div>
          ))}
        </div>
      )}

      {reviewProducto && (
        <ProductReviews
          productoId={reviewProducto.id}
          productoNombre={reviewProducto.nombre}
          onClose={() => setReviewProducto(null)}
        />
      )}
    </div>
  );
};

export default Comestibles;
