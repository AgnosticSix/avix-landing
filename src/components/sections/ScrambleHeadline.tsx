'use client';

import { useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScramble } from '@/hooks/useScramble';

/** Retardo cuando hay pantalla de carga: el efecto arranca al retirarse. */
const DELAY_WITH_LOADER_MS = 1500;
const DELAY_WITHOUT_LOADER_MS = 200;

export interface ScrambleHeadlineProps {
  /** Primera mitad del titular, sin efecto. */
  readonly lead: string;
  /** Segunda mitad, resaltada y descifrada. */
  readonly highlight: string;
  readonly showLoader: boolean;
  readonly className?: string;
  readonly highlightClassName?: string;
}

/**
 * Titular del hero con descifrado sobre la mitad resaltada.
 *
 * El texto se renderiza completo en el servidor: el efecto lo sustituye después
 * de la hidratación, de modo que buscadores y lectores de pantalla siempre ven
 * la frase real. Al pasar el ratón se repite.
 */
export function ScrambleHeadline({
  lead,
  highlight,
  showLoader,
  className,
  highlightClassName,
}: ScrambleHeadlineProps) {
  const highlightRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const replay = useScramble(highlightRef, highlight, {
    delayMs: showLoader ? DELAY_WITH_LOADER_MS : DELAY_WITHOUT_LOADER_MS,
    enabled: !reducedMotion,
  });

  return (
    <h1 className={className} onMouseEnter={reducedMotion ? undefined : replay}>
      {lead}
      <em ref={highlightRef} className={highlightClassName}>
        {highlight}
      </em>
    </h1>
  );
}
