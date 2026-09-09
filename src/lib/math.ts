/**
 * Utilidades de interpolación compartidas por las animaciones.
 *
 * Son las mismas tres funciones que usan la escena 3D, el recorrido de la luz y
 * el bucle de scroll. Viven aquí para que una corrección en cualquiera de ellas
 * alcance a los tres sitios.
 */

/** Interpolación lineal entre `a` y `b`. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Acota un valor al rango 0–1. */
export const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));

/**
 * Suavizado de Hermite: entra y sale con pendiente cero.
 *
 * Se aplica al progreso *ya acotado*; con valores fuera de 0–1 la curva se
 * dispara. Combínalo siempre con `clamp01`.
 */
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);
