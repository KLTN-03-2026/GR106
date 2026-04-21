import { useState, useEffect, useRef } from 'react';

export const useReveal = <T extends HTMLElement>(threshold = 0.1) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    const target = ref.current;
    if (!target) return;

    let observer: IntersectionObserver | null = null;

    // ✅ FIX: hiện ngay nếu đã nằm trong viewport (không delay khi F5)
    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
    }

    const initObserver = () => {
      if (!target || !(target instanceof Element)) return;

      try {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisible(true);
              if (observer && entry.target) {
                observer.unobserve(entry.target);
              }
            }
          },
          { threshold }
        );

        if (document.body.contains(target)) {
          observer.observe(target);
        }
      } catch (error) {
        console.warn('IntersectionObserver init failed:', error);
        setVisible(true);
      }
    };

    // ❌ BỎ requestAnimationFrame → gây delay
    initObserver();

    return () => {
      if (observer && target instanceof Element) {
        try {
          observer.unobserve(target);
        } catch (e) {}
        observer.disconnect();
      }
    };
  }, [threshold]);

  return { ref, visible };
};