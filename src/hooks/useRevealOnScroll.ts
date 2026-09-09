'use client';

import { useEffect } from 'react';

const REVEAL_ATTRIBUTE = 'data-reveal';
const VISIBILITY_THRESHOLD = 0.12;

/**
 * Revela los elementos marcados con `data-reveal` cuando entran en pantalla.
 *
 * Se observa el documento en lugar de exponer una `ref` por elemento: las
 * secciones son componentes de servidor y no pueden llevar `ref`. El estado
 * inicial (opacidad y desplazamiento) lo pone CSS, de modo que sin JavaScript
 * el contenido igualmente se ve — la regla vive en `reveal.module.css`.
 */
export function useRevealOnScroll(enabled = true): void {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(`[${REVEAL_ATTRIBUTE}]`);

    if (!enabled) {
      elements.forEach((element) => element.setAttribute('data-revealed', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }
      },
      { threshold: VISIBILITY_THRESHOLD },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled]);
}
