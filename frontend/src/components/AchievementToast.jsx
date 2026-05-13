import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Gift, ShoppingBag, Flame, Crown, Award, Target, Sparkles, Wallet, TrendingUp } from 'lucide-react';

const ICON_MAP = {
  trophy: Trophy, star: Star, zap: Zap, gift: Gift,
  shopping: ShoppingBag, flame: Flame, crown: Crown, award: Award, target: Target, sparkles: Sparkles,
  wallet: Wallet, 'trending-up': TrendingUp
};

const AchievementToast = ({ logro, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = ICON_MAP[logro.icono] || Trophy;

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.8)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      maxWidth: '360px', width: '100%'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        borderRadius: '16px', padding: '1rem 1.25rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,215,0,0.15)',
        display: 'flex', alignItems: 'center', gap: '1rem',
        border: '1px solid rgba(255,215,0,0.2)'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #fbc02d, #ff9800)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, animation: visible ? 'none' : undefined
        }}>
          <Icon size={24} color="#1a1a1a" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fbc02d', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.15rem' }}>
            🎉 Logro Desbloqueado
          </div>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{logro.nombre}</div>
          {logro.descripcion && <div style={{ color: '#999', fontSize: '0.8rem' }}>{logro.descripcion}</div>}
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 400); }}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;
