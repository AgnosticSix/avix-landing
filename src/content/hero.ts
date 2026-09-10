import { TAGLINE_PARTS } from '@/config/site';

/**
 * Contenido del hero.
 *
 * El titular está partido en dos porque la segunda mitad se resalta en cian y
 * es la que recibe el efecto de descifrado. Las dos mitades **no** se escriben
 * aquí: salen de `TAGLINE_PARTS`, que es también de donde sale `tagline` y con
 * ella el `<title>` y la tarjeta social. Cuando estaban duplicadas divergieron,
 * y el `<h1>` acabó preguntando algo distinto que la etiqueta de título.
 */
export const HERO = {
  eyebrow: 'IA aplicada a empresas serias',
  headline: TAGLINE_PARTS,
  lead: 'AVIX encuentra las tareas que consumen tiempo todos los días y construye sistemas que pueden hacer ese trabajo automática e inteligentemente.',
  support:
    'Desde revisar información y dar seguimiento hasta actualizar sistemas, preparar documentos o detectar pendientes.',
  reassurance: 'Tu equipo conserva las decisiones importantes.',
  closing: 'Automatiza lo repetitivo. Conserva el control.',
  secondaryCta: 'Ver ejemplos',
} as const;

/**
 * Quién ejecuta cada paso del flujo. Determina el color del rótulo y, en el
 * caso de `human`, también el de la tarjeta.
 *
 * `trigger` es el hecho que dispara el flujo: no lo ejecuta nadie, simplemente
 * ocurre, así que se rotula en gris y no se atribuye ni a la IA ni al equipo.
 */
export type FlowActor = 'trigger' | 'ai' | 'human';

export interface FlowStep {
  readonly actor: FlowActor;
  /** Etiqueta superior: quién actúa, o «Llega» para el disparador. */
  readonly kicker: string;
  readonly title: string;
  readonly detail: string;
}

/**
 * Flujo de ejemplo del hero: una solicitud que se resuelve sola hasta que hace
 * falta el criterio de una persona.
 */
export const HERO_FLOW: readonly FlowStep[] = [
  {
    actor: 'trigger',
    kicker: 'Llega',
    title: 'Entra una solicitud',
    detail: 'Por correo, WhatsApp o un formulario.',
  },
  {
    actor: 'ai',
    kicker: 'La IA',
    title: 'La lee y entiende de qué se trata',
    detail: 'Sin que nadie la copie a mano.',
  },
  {
    actor: 'ai',
    kicker: 'La IA',
    title: 'Actualiza tu sistema',
    detail: 'Registro creado, responsable asignado.',
  },
  {
    actor: 'ai',
    kicker: 'La IA',
    title: 'Detecta que falta un documento',
    detail: 'Y lo pide al cliente automáticamente.',
  },
  {
    actor: 'human',
    kicker: 'Una persona',
    title: 'Recibe el aviso y decide',
    detail: 'Solo cuando hace falta su criterio.',
  },
];

export const FLOW_LEGEND = [
  { actor: 'ai' as const, label: 'La IA' },
  { actor: 'human' as const, label: 'Una persona' },
];
