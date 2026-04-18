import { useState, useEffect, useRef } from 'react';

export const useReveal = (threshold = 0.1) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    const target = ref.current;
    if (!target) return;

    let observer: IntersectionObserver | null = null;

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

        if (target instanceof Element && document.body.contains(target)) {
          observer.observe(target);
        }
      } catch (error) {
        console.warn('IntersectionObserver init failed:', error);
        setVisible(true);
      }
    };

    // Wait for next frame to ensure DOM is fully rendered
    const frameId = requestAnimationFrame(initObserver);

    return () => {
      cancelAnimationFrame(frameId);
      if (observer && target instanceof Element) {
        try {
          observer.unobserve(target);
        } catch (e) {
          // Ignore cleanup errors
        }
        observer.disconnect();
      }
    };
  }, [threshold]);

  return { ref, visible };
};
