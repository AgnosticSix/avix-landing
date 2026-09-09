/** Las tres etapas de un proyecto, en orden. */
export interface ProcessStep {
  readonly title: string;
  readonly description: string;
}

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    title: 'Entendemos',
    description:
      'Nos enseñas qué hacen hoy las personas, qué herramientas utilizan y dónde se pierde tiempo.',
  },
  {
    title: 'Diseñamos',
    description:
      'Definimos qué puede automatizarse, qué tecnología hace falta y qué debe seguir dependiendo de una persona.',
  },
  {
    title: 'Implementamos',
    description: 'Construimos, probamos con casos reales y medimos antes de ampliar.',
  },
];
