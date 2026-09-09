/**
 * Configuración del sitio.
 *
 * `featureFlags` y `ctaLabel` provienen del panel de propiedades del prototipo
 * original (los `data-props` del artefacto). Se conservan como configuración
 * tipada porque siguen siendo los interruptores útiles: permiten apagar el
 * fondo 3D o probar variantes de copy sin tocar los componentes.
 */

/** Variantes del texto del CTA principal, para pruebas A/B. */
export const CTA_LABELS = [
  'Descubrir qué puedo automatizar',
  'Quiero saber qué puedo automatizar',
  'Agendar diagnóstico',
] as const;

export type CtaLabel = (typeof CTA_LABELS)[number];

export interface FeatureFlags {
  /** Pantalla de carga con contador de porcentaje. */
  readonly showLoader: boolean;
  /** Movimiento de cámara del fondo 3D ligado al scroll. */
  readonly sectionMotion: boolean;
  /** Luz viajera del isotipo y el resplandor que proyecta sobre los títulos. */
  readonly nodeLight: boolean;
}

export interface SiteConfig {
  readonly name: string;
  readonly url: string;
  readonly locale: string;
  /** La pregunta de marca, sin el nombre delante. Es la única fuente del titular. */
  readonly tagline: string;
  /** La promesa de dos frases. Aparece en el pie y en la vista previa social. */
  readonly promise: string;
  readonly title: string;
  readonly description: string;
  readonly openGraph: {
    readonly title: string;
    readonly description: string;
  };
  readonly contactEmail: string;
  readonly ctaLabel: CtaLabel;
  readonly featureFlags: FeatureFlags;
}

const NAME = 'AVIX';
const TAGLINE = '¿Qué parte de tu trabajo podría hacer la IA por ti?';
const PROMISE = 'Primero entendemos. Después automatizamos.';

export const siteConfig: SiteConfig = {
  name: NAME,
  url: 'https://www.avixsoluciones.com',
  locale: 'es',
  tagline: TAGLINE,
  promise: PROMISE,
  title: `${NAME} | ${TAGLINE}`,
  description:
    'AVIX encuentra las tareas que consumen tiempo todos los días en tu empresa y construye sistemas con IA que pueden hacer parte de ese trabajo automáticamente. Tu equipo conserva las decisiones importantes.',
  openGraph: {
    title: `${NAME} — ${TAGLINE}`,
    description: `${PROMISE} Descubre qué parte de tu operación podría trabajar sola.`,
  },
  contactEmail: 'contacto@avixsoluciones.com',
  ctaLabel: CTA_LABELS[0],
  featureFlags: {
    showLoader: true,
    sectionMotion: true,
    nodeLight: true,
  },
};
