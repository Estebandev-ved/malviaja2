import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import WhatsAppButton from './WhatsAppButton';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const observeNewNodes = () => {
      const revealNodes = document.querySelectorAll('[data-reveal]:not(.is-visible)');
      revealNodes.forEach((node) => observer.observe(node));
    };

    // Observar nodos iniciales
    observeNewNodes();

    // Observar cambios en el DOM para capturar contenido dinámico (como el catálogo)
    const mutationObserver = new MutationObserver(() => {
      observeNewNodes();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);


  useEffect(() => {
    document.body.classList.add('custom-cursor-enabled');
    return () => document.body.classList.remove('custom-cursor-enabled');
  }, []);

  useEffect(() => {
    const titles = Array.from(document.querySelectorAll('[data-typewriter-prefix]'));
    if (titles.length === 0) return undefined;

    const escapeHtml = (value) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const timers = titles.map((title) => {
      const prefix = title.getAttribute('data-typewriter-prefix') || '';
      const highlight = title.getAttribute('data-typewriter-highlight') || '';
      const suffix = title.getAttribute('data-typewriter-suffix') || '';
      const full = `${prefix}${highlight}${suffix}`;

      let index = 0;
      let timeoutId;
      const tick = () => {
        const current = full.slice(0, index + 1);
        const prefixPart = current.slice(0, Math.min(current.length, prefix.length));
        const highlightStart = prefix.length;
        const highlightEnd = prefix.length + highlight.length;
        const highlightPart = current.length > highlightStart
          ? current.slice(highlightStart, Math.min(current.length, highlightEnd))
          : '';
        const suffixPart = current.length > highlightEnd
          ? current.slice(highlightEnd)
          : '';

        const markup = `${escapeHtml(prefixPart)}<span class="text-secondary">${escapeHtml(highlightPart)}</span>${escapeHtml(suffixPart)}`;
        title.innerHTML = `<span class="typewriter-text">${markup}</span>`;

        index += 1;
        if (index >= full.length) {
          const span = title.querySelector('.typewriter-text');
          if (span) {
            span.classList.add('typewriter-done');
          }
          return null;
        }
        timeoutId = window.setTimeout(tick, 45);
        return null;
      };

      timeoutId = window.setTimeout(tick, 180);
      return () => window.clearTimeout(timeoutId);
    });

    return () => {
      timers.forEach((cancel) => {
        if (typeof cancel === 'function') cancel();
      });
    };
  }, [location.pathname]);

  useEffect(() => {
    const applyStagger = () => {
      const staggerGroups = document.querySelectorAll('[data-stagger="true"]:not(.stagger-applied)');
      staggerGroups.forEach((group) => {
        group.classList.add('stagger-applied');
        group.classList.add('is-visible');
        const items = group.querySelectorAll('[data-reveal]');
        items.forEach((item, index) => {
          item.style.transitionDelay = `${index * 90}ms`;
        });
      });
    };

    applyStagger();
    const mutationObserver = new MutationObserver(applyStagger);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => mutationObserver.disconnect();
  }, [location.pathname]);


  useEffect(() => {
    const handleRipple = (event) => {
      const button = event.target.closest('.btn');
      if (!button || button.disabled) return;

      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'btn__ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };

    document.addEventListener('click', handleRipple);
    return () => document.removeEventListener('click', handleRipple);
  }, []);

  useEffect(() => {
    const magneticTargets = Array.from(document.querySelectorAll('[data-magnetic="true"]'));
    if (magneticTargets.length === 0) return undefined;

    const handlers = magneticTargets.map((target) => {
      const strength = Number(target.getAttribute('data-magnetic-strength')) || 0.18;

      const onMove = (event) => {
        const rect = target.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        target.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
      };

      const onLeave = () => {
        target.style.transform = '';
      };

      target.addEventListener('mousemove', onMove);
      target.addEventListener('mouseleave', onLeave);

      return { target, onMove, onLeave };
    });

    return () => {
      handlers.forEach(({ target, onMove, onLeave }) => {
        target.removeEventListener('mousemove', onMove);
        target.removeEventListener('mouseleave', onLeave);
      });
    };
  }, [location.pathname]);

  return (
    <div className="layout">
      <Navbar />
      <CartDrawer />
      <main className="main-content">
        <div className="page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
