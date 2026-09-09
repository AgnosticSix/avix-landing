/**
 * Los dos carriles de la comparación «Antes / Después».
 *
 * Ambos describen el mismo proceso; se muestran en paralelo y se van
 * encendiendo paso a paso para que la diferencia de esfuerzo se vea sola.
 */

export interface LaneStep {
  readonly text: string;
  /**
   * El paso lo ejecuta una persona. Sólo se usa en el carril automatizado,
   * donde marca el único punto en que hace falta criterio humano.
   */
  readonly human?: boolean;
  /** Fragmento resaltado dentro del texto. */
  readonly emphasis?: string;
}

export interface Lane {
  readonly key: 'manual' | 'avix';
  readonly title: string;
  readonly steps: readonly LaneStep[];
}

export const LANES: readonly Lane[] = [
  {
    key: 'manual',
    title: 'Hoy',
    steps: [
      { text: 'Llega una solicitud.' },
      { text: 'Alguien la lee.' },
      { text: 'La copia a Excel.' },
      { text: 'Busca información.' },
      { text: 'Pregunta qué falta.' },
      { text: 'Avisa a otra persona.' },
      { text: 'Espera respuesta.' },
      { text: 'Actualiza un reporte.' },
    ],
  },
  {
    key: 'avix',
    title: 'Con AVIX',
    steps: [
      { text: 'Llega la solicitud.' },
      { text: 'Se registra automáticamente.' },
      { text: 'La IA identifica de qué se trata.' },
      { text: 'Revisa si falta información.' },
      { text: 'Actualiza el sistema.' },
      { text: 'Asigna la siguiente tarea.' },
      { text: 'Da seguimiento.' },
      {
        text: 'Y si necesita una decisión, ',
        emphasis: 'avisa a la persona correcta con toda la información lista.',
        human: true,
      },
    ],
  },
];

export const BEFORE_AFTER_OUTCOMES = [
  { text: 'Menos captura.', highlight: false },
  { text: 'Menos persecución.', highlight: false },
  { text: 'Menos cosas olvidadas.', highlight: false },
  { text: 'Más tiempo para decidir.', highlight: true },
] as const;
