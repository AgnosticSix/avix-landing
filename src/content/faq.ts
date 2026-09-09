/**
 * Preguntas frecuentes.
 *
 * Se renderizan con `<details>` nativo: sin JavaScript, accesible por defecto y
 * visible para los buscadores aunque esté plegado.
 */
export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

export const FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    question: '¿Tengo que cambiar los sistemas que ya utilizo?',
    answer:
      'No necesariamente. Si sirven, intentamos conectarlos. Solo proponemos reemplazar algo cuando realmente limita el proceso.',
  },
  {
    question: '¿Necesito saber qué quiero automatizar?',
    answer: 'No. Parte de nuestro trabajo es encontrarlo contigo.',
  },
  {
    question: '¿La IA puede cometer errores?',
    answer:
      'Sí. Por eso definimos límites, registros y decisiones que siempre requieren a una persona.',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      'Depende del proceso y de la complejidad. Primero entendemos el problema y después cotizamos alcance real.',
  },
  {
    question: '¿Por dónde empezamos?',
    answer: 'Con una conversación para entender qué haces hoy y detectar qué podría automatizarse.',
  },
];
