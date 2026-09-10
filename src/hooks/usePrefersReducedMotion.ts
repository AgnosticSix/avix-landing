'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;

/**
 * En el servidor no hay `matchMedia`. Se asume que no hay preferencia y el
 * valor real llega en la hidratación: lo que depende de esto son animaciones
 * decorativas, y ninguna arranca antes de ese momento.
 */
const getServerSnapshot = (): boolean => false;

/**
 * Indica si el usuario ha pedido reducir el movimiento.
 *
 * Usa `useSyncExternalStore` en lugar de `useState` + `useEffect`: la
 * preferencia es estado que vive fuera de React, y así se lee sin provocar un
 * render en cascada tras el montaje.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Lectura síncrona de la misma preferencia, para usar dentro de un efecto.
 *
 * El hook no sirve para decidir si lanzar una descarga: durante la hidratación
 * devuelve el valor del servidor (`false`) y sólo se corrige en el render
 * siguiente, cuando el efecto ya se habría disparado. Aquí se consulta el
 * navegador directamente, que dentro de un efecto siempre está disponible.
 */
export function prefersReducedMotionNow(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}
