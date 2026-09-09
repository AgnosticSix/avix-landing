'use client';

import { useEffect, useState } from 'react';

import { siteConfig } from '@/config/site';
import { prefersReducedMotionNow, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';
import { useScrollScene } from '@/hooks/useScrollScene';
import { track } from '@/lib/analytics';
import type { AvixScene } from '@/lib/scene/avix-scene';

import { Loader } from './Loader';

type SceneFactory = (canvas: HTMLCanvasElement) => AvixScene | null;

/**
 * Pone en marcha todo el comportamiento global de la página: pantalla de carga,
 * revelado al hacer scroll y el bucle de animación del fondo.
 *
 * Es el único componente cliente del armazón. Las secciones se renderizan en el
 * servidor; éste sólo se ocupa de lo que necesita el navegador.
 */
export function SceneController() {
  const reducedMotion = usePrefersReducedMotion();
  const [createScene, setCreateScene] = useState<SceneFactory | null>(null);

  useRevealOnScroll(!reducedMotion);

  useEffect(() => {
    track('view_home');
  }, []);

  useEffect(() => {
    // Three.js pesa ~600 KB: se carga en su propio fragmento, después de la
    // primera pintura, y nunca si el usuario ha pedido reducir el movimiento.
    // Se consulta al navegador en vez de usar `reducedMotion`, que en este
    // primer efecto todavía vale `false` por venir del render del servidor.
    if (reducedMotion || prefersReducedMotionNow()) return;

    let cancelled = false;
    void import('@/lib/scene/avix-scene').then(({ createAvixScene }) => {
      // `setState` con una función la interpretaría como actualizador, de ahí
      // el envoltorio: lo que se guarda es la fábrica, no su resultado.
      if (!cancelled) setCreateScene(() => createAvixScene);
    });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  useScrollScene({ createScene, reducedMotion });

  return <Loader enabled={siteConfig.featureFlags.showLoader} reducedMotion={reducedMotion} />;
}
