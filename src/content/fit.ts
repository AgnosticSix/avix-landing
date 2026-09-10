/** Señales de que automatizar tiene sentido. */
export const FIT_SIGNALS: readonly string[] = [
  'Tu equipo repite tareas todos los días',
  'La información vive en varios lugares',
  'Los seguimientos dependen de memoria',
  'Un error o retraso cuesta dinero',
  'Necesitas saber qué pasó y quién debe actuar',
  'Quieres utilizar IA pero no sabes por dónde empezar',
];

/** Contrapunto honesto: cuándo AVIX no aporta. */
export const NOT_A_FIT = {
  title: 'Probablemente no necesitas AVIX si…',
  description:
    'Un software estándar ya resuelve perfectamente tu operación o prácticamente no tienes tareas repetitivas.',
} as const;
