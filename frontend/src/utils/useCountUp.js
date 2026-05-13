import { useState, useEffect, useRef } from 'react';

const useCountUp = (end = 0, duration = 1000, enabled = true) => {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!enabled || end === 0) {
      setCount(end);
      return;
    }

    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [end, duration, enabled]);

  return count;
};

export default useCountUp;
