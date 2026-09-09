/**
 * Capa de analítica: empuja eventos a `window.dataLayer` (Google Tag Manager).
 *
 * Se define aquí un único punto de contacto con `dataLayer` para que los
 * componentes no toquen `window` y para poder sustituir el proveedor sin
 * buscar llamadas sueltas por todo el árbol.
 */

export type AnalyticsEvent =
  'view_home' | 'quiz_start' | 'quiz_step' | 'quiz_complete' | 'vertical_view' | 'cta_click';

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Registra un evento. En servidor no hace nada. */
export function track(event: AnalyticsEvent | string, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}
