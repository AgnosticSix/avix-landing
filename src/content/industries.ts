/**
 * Ejemplos por sector. Cada uno es una pestaña de la sección «Ejemplos».
 *
 * Deliberadamente no son casos de estudio con cifras: la propuesta es que el
 * proceso se analiza, no que exista una plantilla por industria.
 */

export interface IndustryTag {
  readonly label: string;
  /** La etiqueta describe una intervención humana: se dibuja en cobre. */
  readonly escalates?: boolean;
}

export interface Industry {
  readonly key: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  /** Segundo párrafo, más tenue. Sólo algunos sectores lo tienen. */
  readonly detail?: string;
  readonly tags: readonly IndustryTag[];
}

export const INDUSTRIES: readonly Industry[] = [
  {
    key: 'inmuebles',
    label: 'Bienes inmuebles',
    title: 'De un prospecto nuevo al seguimiento de la operación.',
    description:
      'La IA puede ayudar a calificar interesados, revisar documentación, detectar pendientes, programar seguimientos, actualizar propiedades, preparar información y avisar cuando alguien debe intervenir.',
    tags: [
      { label: 'Calificar interesados' },
      { label: 'Revisar documentos' },
      { label: 'Programar seguimientos' },
      { label: 'Actualizar propiedades' },
      { label: 'Avisar cuando alguien debe intervenir', escalates: true },
    ],
  },
  {
    key: 'industria',
    label: 'Fábricas e industria',
    title: 'Menos persecución entre áreas.',
    description:
      'Una orden puede avanzar entre compras, producción, calidad, mantenimiento y entrega sin depender de que alguien recuerde avisar al siguiente.',
    detail:
      'La IA puede detectar faltantes, generar avisos, actualizar información y señalar retrasos.',
    tags: [
      { label: 'Compras → producción' },
      { label: 'Calidad y mantenimiento' },
      { label: 'Detectar faltantes' },
      { label: 'Señalar retrasos' },
      { label: 'Avisar al siguiente responsable' },
    ],
  },
  {
    key: 'servicios',
    label: 'Servicios profesionales',
    title:
      'Menos tiempo administrando expedientes y más tiempo haciendo el trabajo que realmente importa.',
    description:
      'Captación, documentos, pendientes, citas, seguimiento, investigación, cobro y reportes pueden automatizarse total o parcialmente.',
    tags: [
      { label: 'Captación' },
      { label: 'Documentos y pendientes' },
      { label: 'Citas y seguimiento' },
      { label: 'Investigación' },
      { label: 'Cobro y reportes' },
    ],
  },
];
