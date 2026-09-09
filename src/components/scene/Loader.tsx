'use client';

import { useEffect, useState } from 'react';

import { AvixLogo } from '@/components/ui/AvixLogo';

import styles from './Loader.module.css';

/**
 * Pantalla de carga con contador.
 *
 * No mide carga real: es una cortina de marca que cubre el primer segundo,
 * durante el cual se compilan los shaders de la escena y se resuelven las
 * fuentes. El contador usa una curva cúbica de salida para que avance rápido y
 * frene al final, que es como se percibe una carga «que va bien».
 */

const DURATION_MS = 1300;
/** Debe coincidir con `transition: opacity` en el módulo CSS. */
const FADE_MS = 750;

type LoaderState = 'running' | 'fading' | 'done';

export interface LoaderProps {
  /** Si es `false`, no se muestra nada. */
  readonly enabled: boolean;
  /** Con movimiento reducido se omite la animación y se cierra de inmediato. */
  readonly reducedMotion: boolean;
}

export function Loader({ enabled, reducedMotion }: LoaderProps) {
  const [percent, setPercent] = useState(0);
  const [state, setState] = useState<LoaderState>('running');

  // Sin animación no hay nada que temporizar: el render ya devuelve `null`.
  const active = enabled && !reducedMotion;

  useEffect(() => {
    if (!active) return;

    const startedAt = performance.now();
    let frameId = 0;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setPercent(Math.round(eased * 100));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      setState('fading');
      fadeTimer = setTimeout(() => setState('done'), FADE_MS);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [active]);

  if (!active || state === 'done') return null;

  return (
    <div
      className={styles.loader}
      data-state={state}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <AvixLogo height={30} />
      <div className={styles.tagline}>Primero entendemos</div>
      <div className={styles.percent} aria-hidden="true">
        {percent}%
      </div>
    </div>
  );
}
