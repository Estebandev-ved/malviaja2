import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Sparkles, Brain, Scale, Utensils, CheckCircle2, Leaf, GlassWater, Trees, Flame, Smile, PartyPopper, Rocket, Feather, User, Shield, Pizza } from 'lucide-react';

const Quiz = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const { addToCart, toggleCart } = useStore();
  const navigate = useNavigate();

  const handleSelect = (key, value) => {
    setAnswers({ ...answers, [key]: value });
    if (step < 4) setStep(step + 1);
  };

  const calculateDosage = () => {
    // Valores Base según Tolerancia
    let base = 5;
    if (answers.tolerance === 'ocasional') base = 15;
    if (answers.tolerance === 'frecuente') base = 35;
    if (answers.tolerance === 'diario') base = 60;

    // Multiplicador por Peso
    let weightMult = 1.0;
    if (answers.weight === 'ligero') weightMult = 0.8;
    if (answers.weight === 'pesado') weightMult = 1.25;

    // Multiplicador por Experiencia
    let effectMult = 1.0;
    if (answers.effect === 'suave') effectMult = 0.6;
    if (answers.effect === 'intenso') effectMult = 1.5;

    let totalMg = Math.round(base * weightMult * effectMult);
    
    // Limits de seguridad
    if (totalMg < 5) totalMg = 5;
    if (answers.tolerance === 'primera_vez' && totalMg > 15) totalMg = 10; // Safety cap
    if (totalMg > 150) totalMg = 150;

    // Calcular Precio Dinámico
    let price = 15000;
    if (totalMg > 20) price = 20000;
    if (totalMg > 50) price = 25000;
    if (totalMg > 80) price = 30000;

    return { totalMg, price };
  };

  const finishQuiz = () => {
    const { totalMg, price } = calculateDosage();
    
    // Crear el producto personalizado
    const customBrownie = {
      id: `custom_${Date.now()}`,
      nombre: `Brownie a tu Medida (${totalMg}mg THC)`,
      precio: price,
      descripcion: `Preparado científicamente para ti. Dosis: ${totalMg}mg. Nivel: ${answers.tolerance.toUpperCase()}`,
      dosis: 'Personalizada',
      dosisMg: totalMg
    };

    addToCart(customBrownie);
    toggleCart(); // Abre el carrito
    navigate('/comestibles'); // Lo lleva de vuelta al catálogo
  };

  return (
    <div className="container py-16" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
      <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%' }}>
        
        {step < 5 && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <span style={{ background: 'var(--color-primary-light)', color: 'white', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Pregunta {step} de 4
            </span>
          </div>
        )}

        {/* PREGUNTA 1 */}
        {step === 1 && (
          <div className="quiz-slide animation-fade">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Brain size={48} className="text-primary" style={{ margin: '0 auto 1rem' }} />
              <h2 className="section-title">¿Cuál es tu nivel de tolerancia?</h2>
              <p className="text-text-light">Sé honesto. Esto es clave para que no tengas un mal viaje.</p>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('tolerance', 'primera_vez')}>
                <Leaf size={20} /> Es mi primera vez (o casi nunca consumo)
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('tolerance', 'ocasional')}>
                <GlassWater size={20} /> Ocasional (Solo en fiestas o fines de semana)
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('tolerance', 'frecuente')}>
                <Trees size={20} /> Frecuente (Varias veces a la semana)
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('tolerance', 'diario')}>
                <Flame size={20} /> Snoop Dogg (Consumo todos los días)
              </button>
            </div>
          </div>
        )}

        {/* PREGUNTA 2 */}
        {step === 2 && (
          <div className="quiz-slide animation-fade">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Sparkles size={48} className="text-secondary" style={{ margin: '0 auto 1rem' }} />
              <h2 className="section-title">¿Qué experiencia buscas hoy?</h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('effect', 'suave')}>
                <Smile size={20} /> Relajación suave (Ver una película y dormir)
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('effect', 'medio')}>
                <PartyPopper size={20} /> Divertido (Risas y socializar con amigos)
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('effect', 'intenso')}>
                <Rocket size={20} /> Malviaja2 (Quiero un viaje astral intenso)
              </button>
            </div>
          </div>
        )}

        {/* PREGUNTA 3 */}
        {step === 3 && (
          <div className="quiz-slide animation-fade">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Scale size={48} className="text-primary-dark" style={{ margin: '0 auto 1rem' }} />
              <h2 className="section-title">Tu peso corporal</h2>
              <p className="text-text-light">El THC se almacena en grasa, tu peso afecta la absorción.</p>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('weight', 'ligero')}>
                <Feather size={20} /> Menos de 60 kg
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('weight', 'medio')}>
                <User size={20} /> Entre 60 kg y 85 kg
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => handleSelect('weight', 'pesado')}>
                <Shield size={20} /> Más de 85 kg
              </button>
            </div>
          </div>
        )}

        {/* PREGUNTA 4 */}
        {step === 4 && (
          <div className="quiz-slide animation-fade">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Utensils size={48} className="text-primary" style={{ margin: '0 auto 1rem' }} />
              <h2 className="section-title">¿Cómo planeas consumirlo?</h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => { handleSelect('food', 'vacio'); setStep(5); }}>
                <Utensils size={20} /> Estómago vacío (Pega más rápido y fuerte)
              </button>
              <button className="btn btn--secondary w-full" style={{ padding: '1.5rem', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => { handleSelect('food', 'lleno'); setStep(5); }}>
                <Pizza size={20} /> Después de una buena comida (Efecto prolongado)
              </button>
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {step === 5 && (
          <div className="quiz-slide animation-fade" style={{ textAlign: 'center' }}>
            <CheckCircle2 size={64} className="text-secondary" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="section-title">¡Tenemos tu dosis perfecta!</h2>
            
            <div style={{ background: '#fff8e1', padding: '2rem', borderRadius: 'var(--radius-md)', margin: '2rem 0', border: '2px dashed var(--color-secondary)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Dosis Científica Calculada:</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
                {calculateDosage().totalMg} mg <span style={{ fontSize: '1.5rem' }}>THC</span>
              </div>
              <p style={{ color: 'var(--color-text-light)' }}>Esta cantidad está diseñada específicamente para tu metabolismo y tolerancia.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem' }}>
              <span className="font-bold text-primary">Valor de preparación:</span>
              <span className="font-bold text-secondary" style={{ fontSize: '1.5rem' }}>${calculateDosage().price.toLocaleString()}</span>
            </div>

            <button className="btn btn--primary w-full" style={{ padding: '1.25rem', fontSize: '1.2rem' }} onClick={finishQuiz}>
              Añadir este Brownie al Carrito
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Quiz;
