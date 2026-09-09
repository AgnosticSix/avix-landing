import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * Tipografías del sitio, autoalojadas por `next/font` (sin peticiones a
 * Google en tiempo de ejecución y sin salto de composición).
 *
 * No se declara `weight` a propósito. Las dos son fuentes variables, así que
 * `next/font` sirve el mismo archivo se pidan los pesos que se pidan: fijar una
 * lista no ahorraba ni un byte —se comprobó, son los mismos diez `.woff2`— y
 * sólo multiplicaba las reglas `@font-face`, una por peso y subconjunto.
 *
 * Sin lista, además, cualquier peso del rango queda disponible. Con ella sólo
 * se declaran las caras enumeradas, así que un `font-weight` fuera de la lista
 * se arriesga a que el navegador lo sintetice en vez de recorrer el eje. Hoy no
 * ocurre —todos los pesos en uso estaban declarados—, pero es un riesgo que
 * desaparece al quitarla.
 *
 * El diseño usa 400/500/600 en Inter y 400/500/700 en Space Grotesk; quitar la
 * lista no alteró la geometría de ninguno de los 163 textos medidos en la
 * comprobación de paridad.
 */

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
