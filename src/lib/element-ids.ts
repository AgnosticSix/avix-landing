/**
 * Ids de los elementos que anima el bucle de scroll.
 *
 * Viven en un módulo neutro —sin `'use client'`— a propósito: los usan tanto
 * componentes de servidor (que escriben el `id` en el marcado) como el hook de
 * cliente que los busca. Si se exportaran desde un módulo de cliente, Next
 * convertiría la constante en una referencia de cliente y los componentes de
 * servidor recibirían un valor vacío, sin ningún error visible.
 *
 * Son el contrato entre `useScrollScene` y el marcado: renombrar uno aquí
 * obliga a renombrarlo en su componente.
 */
export const ELEMENT_IDS = {
  nav: 'topnav',
  navCta: 'nav-cta',
  heroCta: 'hero-cta',
  canvas: 'gl',
  neural: 'neural',
  neuralRoute: 'neural-route',
  neuralPulse: 'neural-pulse',
  neuralPulseGlow: 'neural-pulse-glow',
} as const;
