import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const Comestibles = () => {
  const { productos, fetchProductos, loading, addToCart, toggleCart } = useStore();

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleAdd = (prod) => {
    addToCart(prod);
    toggleCart(); // Abre el carrito para mostrar que se añadió
  };

  return (
    <div className="container py-16">
      <h1 className="section-title text-center">Nuestro Catálogo</h1>
      <p className="text-center text-primary" style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Selecciona tu compañero de viaje. Recuerda consumir con responsabilidad y esperar al menos 45 minutos para sentir los efectos.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          Cargando los mejores brownies...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {/* Tarjeta del Brownie Personalizado */}
          <div className="feature-card glass" style={{ textAlign: 'left', border: '2px solid var(--color-secondary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.25rem 1rem', fontWeight: 'bold', fontSize: '0.8rem', borderBottomLeftRadius: '8px' }}>NUEVO</div>
            <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>✨</span>
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
            <div key={prod.id} className="feature-card glass" style={{ textAlign: 'left' }}>
              <div style={{ height: '200px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', backgroundImage: prod.imageUrl ? `url(${prod.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <h3 className="text-primary font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{prod.nombre}</h3>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>{prod.descripcion}</p>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <span className="font-bold text-secondary" style={{ fontSize: '1.25rem' }}>${prod.precio.toLocaleString()}</span>
                <span style={{ fontSize: '0.85rem', background: '#ffe0b2', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#e65100', fontWeight: 'bold' }}>
                  Dosis: {prod.dosis}
                </span>
              </div>
              <button className="btn btn--primary w-full" onClick={() => handleAdd(prod)}>
                Añadir al Carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comestibles;
