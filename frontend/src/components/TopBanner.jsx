import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import './TopBanner.css';

const TopBanner = () => {
  return (
    <div className="top-banner">
      <div className="container top-banner__container">
        <div className="top-banner__content">
          <AlertCircle size={16} className="top-banner__icon" />
          <span className="top-banner__text">
            <strong>AVISO:</strong> Pedidos abiertos hasta mañana en la tarde o hasta agotar existencias. <strong>Despachos mañana.</strong>
          </span>
          <Clock size={16} className="top-banner__icon top-banner__icon--right" />
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
