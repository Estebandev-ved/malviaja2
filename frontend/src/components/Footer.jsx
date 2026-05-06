import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__brand">
          <h3 className="footer__logo-text">Malviaja2</h3>
          <p className="footer__desc">
            Los mejores brownies cannábicos de la ciudad. Una experiencia premium e inolvidable.
          </p>
        </div>
        
        <div className="footer__links">
          <h4>Enlaces</h4>
          <Link to="/">Inicio</Link>
          <Link to="/comestibles">Comestibles</Link>
          <Link to="/quienes-somos">Quiénes Somos</Link>
        </div>
        
        <div className="footer__legal">
          <h4>Legal</h4>
          <Link to="/terminos">Términos y Condiciones</Link>
          <p className="footer__warning">Solo para mayores de edad (18+)</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Malviaja2. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
