/**
 * Enlaces de navegación.
 *
 * Los `href` son absolutos (`/#seccion`) y no meros fragmentos (`#seccion`)
 * porque el pie también se muestra en la página 404: desde allí un fragmento
 * suelto no llevaría a ninguna parte. Dentro de la portada el navegador los
 * resuelve igual, con el mismo desplazamiento suave.
 */

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: '/#te-suena', label: '¿Te suena?' },
  { href: '/#que-hace', label: 'Qué hace AVIX' },
  { href: '/#ejemplos', label: 'Ejemplos' },
  { href: '/#como-empezamos', label: 'Cómo empezamos' },
  { href: '/#equipo', label: 'Nosotros' },
];

export const FOOTER_NAV: readonly NavLink[] = [
  { href: '/#te-suena', label: '¿Te suena?' },
  { href: '/#que-hace', label: 'Qué hace AVIX' },
  { href: '/#agentes', label: 'Agentes de IA' },
  { href: '/#ejemplos', label: 'Ejemplos' },
  { href: '/#como-empezamos', label: 'Cómo empezamos' },
];

/** Ancla del formulario de diagnóstico: el destino de todos los CTA. */
export const DISCOVERY_ANCHOR = '/#descubrir';
