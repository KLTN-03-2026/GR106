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
    
    // ✅ Check if target exists and is a valid DOM Element
    if (!target || !(target instanceof Element)) {
      return;
    }

    let observer: IntersectionObserver | null = null;

    // ✅ FIX: hiện ngay nếu đã nằm trong viewport (không delay khi F5)
    try {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(true);
      }
    } catch (e) {
      // ignore getBoundingClientRect errors
    }

    const initObserver = () => {
      // Final check before initialization
      if (!target || !(target instanceof Element)) return;

      try {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisible(true);
              if (observer && entry.target && entry.target instanceof Element) {
                observer.unobserve(entry.target);
              }
            }
          },
          { threshold }
        );

        // ✅ Final safeguard before calling observe
        if (target instanceof Element && document.body.contains(target)) {
          observer.observe(target);
        } else if (!document.body.contains(target)) {
          // If not in DOM, just show it so we don't have invisible content
          setVisible(true);
        }
      } catch (error) {
        console.warn('IntersectionObserver init failed:', error);
        setVisible(true);
      }
    };

    initObserver();

    return () => {
      if (observer && target && target instanceof Element) {
        try {
          observer.unobserve(target);
        } catch (e) {}
        observer.disconnect();
      }
    };
  }, [threshold, ref.current]); // ✅ ref.current in dependencies to re-run when ref is attached

  return { ref, visible };
};
