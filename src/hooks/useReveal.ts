import { useState, useEffect, useRef } from 'react';

export const useReveal = (threshold = 0.1) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // SSR or Browser compatibility safety check
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    // Capture the current target to be used in the closure
    const target = ref.current;
    
    // Ensure target is a valid DOM Element
    if (!target || !(target instanceof Element)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Once visible, we can stop observing this specific target
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    try {
      observer.observe(target);
    } catch (error) {
      console.warn('IntersectionObserver failed to observe target:', error);
      // Fallback: make it visible if observer fails
      setVisible(true);
    }

    return () => {
      if (target && target instanceof Element) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, visible };
};
