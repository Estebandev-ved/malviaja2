import { Target, Eye, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import './QuienesSomos.css';

const QuienesSomos = () => {
  return (
    <div className="container py-8" style={{ paddingBottom: '6rem' }}>
      {/* Hero Section */}
      <section className="about-hero glass">
        <div className="about-hero__content">
          <h1 className="about-title">Descubre <span className="text-secondary">Malviaja2</span></h1>
          <p className="about-subtitle">
            Nacimos con la idea de cambiar la perspectiva sobre los comestibles cannábicos, ofreciendo una experiencia premium donde el sabor del mejor chocolate es el verdadero protagonista.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-grid">
        <div className="about-card glass">
          <div className="about-card__icon" style={{ background: 'var(--color-primary-light)', color: 'white' }}>
            <Target size={32} />
          </div>
          <div className="about-card__content">
            <h2 className="about-card__title">Nuestra Misión</h2>
            <p style={{ lineHeight: '1.7', color: 'var(--color-text-light)' }}>
              Transformar el consumo de comestibles en una experiencia gourmet, segura y confiable. Nos dedicamos a crear productos con dosis exactas y un sabor excepcional, garantizando que cada viaje sea predecible y disfrutable.
            </p>
          </div>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon" style={{ background: '#fff59d', color: 'var(--color-primary-dark)' }}>
            <Eye size={32} />
          </div>
          <div className="about-card__content">
            <h2 className="about-card__title">Nuestra Visión</h2>
            <p style={{ lineHeight: '1.7', color: 'var(--color-text-light)' }}>
              Ser reconocidos como la marca líder y referente en repostería cannábica, destacando por nuestra calidad insuperable, responsabilidad y por desmitificar el uso recreativo a través de la excelencia.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <h2 className="section-title text-center" style={{ marginBottom: '1rem', color: 'var(--color-primary-dark)', fontWeight: '800', fontSize: '2.5rem' }}>Nuestros Valores</h2>
        <div className="values-grid">
          <div className="value-item">
            <div className="value-icon-wrapper">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Seguridad</h3>
            <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Dosificación exacta y estricto control en cada lote.</p>
          </div>
          <div className="value-item">
            <div className="value-icon-wrapper">
              <Heart size={28} />
            </div>
            <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Pasión</h3>
            <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Amor por la repostería artesanal y el chocolate premium.</p>
          </div>
          <div className="value-item">
            <div className="value-icon-wrapper">
              <Sparkles size={28} />
            </div>
            <h3 className="font-bold text-primary-dark" style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Calidad</h3>
            <p className="text-center" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Solo utilizamos ingredientes y materias primas de la más alta gama.</p>
          </div>
        </div>
      </section>

      {/* Mascot Footer */}
      <div className="mascot-container">
        <img src="/mascota-nobg.png" alt="Mascota Malviaja2" className="mascot-image" />
      </div>
    </div>
  );
};

export default QuienesSomos;
