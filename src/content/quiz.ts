/**
 * Cuestionario de diagnóstico.
 *
 * Las preguntas se declaran como datos, no como marcado: añadir, reordenar o
 * quitar una es editar este archivo, y el componente, la validación y la barra
 * de progreso se ajustan solos.
 */

/** Campo simple dentro de una pregunta de tipo `fields`. */
export interface QuizField {
  readonly name: string;
  readonly placeholder: string;
  readonly label: string;
  readonly autoComplete?: string;
}

interface BaseQuestion {
  readonly id: string;
  /** Enunciado que ve la persona. */
  readonly prompt: string;
  readonly required?: boolean;
}

export interface TextQuestion extends BaseQuestion {
  readonly kind: 'text' | 'textarea';
  /** Clave con la que se envía la respuesta. */
  readonly name: string;
  readonly placeholder: string;
  readonly rows?: number;
}

export interface ChoiceQuestion extends BaseQuestion {
  readonly kind: 'single' | 'multi';
  readonly name: string;
  readonly options: readonly string[];
}

export interface FieldsQuestion extends BaseQuestion {
  readonly kind: 'fields';
  readonly fields: readonly QuizField[];
}

export type QuizQuestion = TextQuestion | ChoiceQuestion | FieldsQuestion;

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'empresa',
    kind: 'text',
    name: 'empresa',
    prompt: '¿A qué se dedica tu empresa?',
    placeholder: 'Ej. despacho contable, inmobiliaria, fábrica de muebles…',
    required: true,
  },
  {
    id: 'personas',
    kind: 'single',
    name: 'personas',
    prompt: '¿Cuántas personas participan en la operación que quieres mejorar?',
    options: ['1 a 5', '6 a 20', '21 a 50', 'Más de 50'],
    required: true,
  },
  {
    id: 'tarea',
    kind: 'textarea',
    name: 'tarea',
    prompt: '¿Qué tarea o proceso se repite más?',
    placeholder: 'Ej. capturar pedidos que llegan por WhatsApp, revisar documentos de clientes…',
    rows: 3,
    required: true,
  },
  {
    id: 'herramientas',
    kind: 'multi',
    name: 'herramientas',
    prompt: '¿Qué herramientas utilizan hoy?',
    options: ['Excel', 'WhatsApp', 'Correo', 'ERP', 'CRM', 'Software propio', 'Papel'],
  },
  {
    id: 'retraso',
    kind: 'textarea',
    name: 'retraso',
    prompt: '¿Qué ocurre cuando algo se retrasa o alguien olvida dar seguimiento?',
    placeholder: 'Ej. el cliente se molesta, se pierde la venta, hay que rehacer el pedido…',
    rows: 3,
  },
  {
    id: 'dejar',
    kind: 'textarea',
    name: 'dejar',
    prompt: '¿Qué te gustaría dejar de hacer manualmente?',
    placeholder: 'Ej. armar el reporte semanal, pasar datos del correo al sistema…',
    rows: 3,
  },
  {
    id: 'sensible',
    kind: 'single',
    name: 'sensible',
    prompt: '¿Existe información sensible o decisiones que siempre debe aprobar una persona?',
    options: ['Sí, varias', 'Algunas', 'No lo sé aún'],
    required: true,
  },
  {
    id: 'contacto',
    kind: 'fields',
    prompt: '¿A dónde te enviamos lo que encontremos?',
    required: true,
    fields: [
      { name: 'nombre', placeholder: 'Tu nombre', label: 'Tu nombre', autoComplete: 'name' },
      {
        name: 'contacto',
        placeholder: 'Correo o WhatsApp',
        label: 'Correo o WhatsApp',
        autoComplete: 'email',
      },
    ],
  },
];

/** Parámetros de campaña que se propagan al correo de contacto. */
export const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

export const DISCOVERY_COPY = {
  eyebrow: 'Siguiente paso',
  heading: 'Descubre qué parte de tu operación podría trabajar sola.',
  lead: 'Cuéntanos cómo funciona hoy tu empresa. Identificaremos dónde se repite trabajo, dónde se pierde tiempo y qué podría automatizarse sin quitarte el control.',
  support: 'No necesitas llegar con una solución pensada. Solo cuéntanos cómo trabajas hoy.',
  resultEyebrow: 'Resultado',
  resultHeading: 'Vemos oportunidades potenciales de automatización.',
  resultLead:
    'Con lo que nos cuentas, hay tareas que probablemente podrían dejar de hacerse a mano.',
  resultClosing: 'El siguiente paso es una conversación de 30 minutos para confirmarlo contigo.',
  resultCta: 'Agendar diagnóstico',
  resultDisclaimer: 'Sin compromiso. Si vemos que un software estándar te resuelve, te lo diremos.',
} as const;
