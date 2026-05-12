import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useStore from '../store/useStore';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleCart, carrito, user } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const linksRef = useRef(null);

  const cartCount = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    const badge = linksRef.current?.querySelector('.cart-badge');
    if (!badge) {
      prevCountRef.current = cartCount;
      return;
    }
    if (cartCount > prevCountRef.current) {
      badge.classList.remove('cart-badge--pop');
      void badge.offsetWidth;
      badge.classList.add('cart-badge--pop');
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const linksEl = linksRef.current;
    if (!linksEl) return;
    const activeLink = linksEl.querySelector('.navbar__link.active');
    const indicator = linksEl.querySelector('.navbar__indicator');
    if (!activeLink || !indicator) return;

    const rect = activeLink.getBoundingClientRect();
    const parentRect = linksEl.getBoundingClientRect();
    const left = rect.left - parentRect.left;
    indicator.style.width = `${rect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }, [location.pathname]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Comestibles', path: '/comestibles' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
  ];

  return (
    <nav className="navbar glass">
      <div className="container navbar__container">
        <Link to="/" className="navbar__logo">
          <img src="/mascota-nobg.png" alt="Malviaja2 Logo" className="navbar__logo-img" />
          <span className="navbar__logo-text">Malviaja2</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar__links desktop-only" ref={linksRef}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <span className="navbar__indicator" />
          <button className="btn btn--primary navbar__cart-btn" onClick={toggleCart} data-magnetic="true" data-magnetic-strength="0.12">
            <ShoppingCart size={20} />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="cart-badge" aria-live="polite">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {(user.rol === 'ADMIN' || user.uid === 'QHjKOXbmDidS1IyyWBJwrH70YSZ2') && (
                <button className="btn btn--secondary" style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={() => navigate('/admin')}>
                  Panel Admin
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginLeft: '1rem' }} onClick={() => navigate('/perfil')}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Perfil" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
              )}
              </div>
            </div>
          ) : (
            <button className="btn" style={{ background: 'transparent', color: 'var(--color-primary-dark)', marginLeft: '1rem', padding: '0.5rem' }} onClick={() => navigate('/login')}>
              Ingresar
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="navbar__toggle mobile-only" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="navbar__mobile-menu glass">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`navbar__mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user && (user.rol === 'ADMIN' || user.uid === 'QHjKOXbmDidS1IyyWBJwrH70YSZ2') && (
            <Link 
              to="/admin"
              className="navbar__mobile-link"
              style={{ color: 'var(--color-primary-dark)', background: 'var(--color-secondary)' }}
              onClick={() => setIsOpen(false)}
            >
              Panel Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
