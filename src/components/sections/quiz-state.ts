import { QUIZ_QUESTIONS, type QuizQuestion } from '@/content/quiz';

/**
 * Estado y transiciones del cuestionario de diagnóstico.
 *
 * Vive aparte del componente para poder razonarlo —y probarlo— sin React: aquí
 * están todas las reglas de avance y validación, y el componente sólo dibuja.
 */

/** Una respuesta es un texto, o una lista en las preguntas de opción múltiple. */
export type Answer = string | string[];

export interface QuizState {
  readonly stepIndex: number;
  readonly answers: Readonly<Record<string, Answer>>;
  /** Se marca al intentar avanzar con una respuesta obligatoria vacía. */
  readonly showValidation: boolean;
  readonly completed: boolean;
  /** Se activa con la primera interacción, para registrar `quiz_start` una vez. */
  readonly started: boolean;
}

export type QuizAction =
  | { type: 'answer'; name: string; value: string }
  | { type: 'toggle'; name: string; value: string }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'complete' };

export const initialQuizState: QuizState = {
  stepIndex: 0,
  answers: {},
  showValidation: false,
  completed: false,
  started: false,
};

export const QUESTION_COUNT = QUIZ_QUESTIONS.length;

const isBlank = (answer: Answer | undefined): boolean =>
  answer === undefined ||
  (Array.isArray(answer) ? answer.length === 0 : answer.trim().length === 0);

/** Nombres de los campos que una pregunta debe rellenar para darse por válida. */
function requiredNames(question: QuizQuestion): readonly string[] {
  if (!question.required) return [];
  return question.kind === 'fields' ? question.fields.map((field) => field.name) : [question.name];
}

/** ¿Está respondida la pregunta actual? Las opcionales siempre lo están. */
export function isStepValid(state: QuizState): boolean {
  const question = QUIZ_QUESTIONS[state.stepIndex];
  if (!question) return false;
  return requiredNames(question).every((name) => !isBlank(state.answers[name]));
}

/** Campos obligatorios sin responder en el paso actual; guía el resaltado. */
export function missingNames(state: QuizState): readonly string[] {
  const question = QUIZ_QUESTIONS[state.stepIndex];
  if (!question) return [];
  return requiredNames(question).filter((name) => isBlank(state.answers[name]));
}

export const isLastStep = (state: QuizState): boolean => state.stepIndex === QUESTION_COUNT - 1;

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer':
      return {
        ...state,
        started: true,
        showValidation: false,
        answers: { ...state.answers, [action.name]: action.value },
      };

    case 'toggle': {
      const current = state.answers[action.name];
      const selected = Array.isArray(current) ? current : [];
      const next = selected.includes(action.value)
        ? selected.filter((option) => option !== action.value)
        : [...selected, action.value];
      return {
        ...state,
        started: true,
        showValidation: false,
        answers: { ...state.answers, [action.name]: next },
      };
    }

    case 'next': {
      if (!isStepValid(state)) return { ...state, showValidation: true };
      if (isLastStep(state)) return state;
      return { ...state, stepIndex: state.stepIndex + 1, showValidation: false };
    }

    case 'back':
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1), showValidation: false };

    case 'complete':
      if (!isStepValid(state)) return { ...state, showValidation: true };
      return { ...state, completed: true };

    default:
      return state;
  }
}

/**
 * Resumen que se muestra al terminar: retoma con sus palabras la tarea que la
 * persona señaló y dónde vive hoy, para que el resultado no parezca genérico.
 */
export function buildSummary(answers: Readonly<Record<string, Answer>>): string {
  const MAX_TASK_LENGTH = 90;
  const parts: string[] = [];

  const task = typeof answers['tarea'] === 'string' ? answers['tarea'].trim() : '';
  if (task) {
    const excerpt = task.length > MAX_TASK_LENGTH ? `${task.slice(0, MAX_TASK_LENGTH)}…` : task;
    parts.push(`Empezando por «${excerpt}».`);
  }

  const tools = answers['herramientas'];
  if (Array.isArray(tools) && tools.length > 0) {
    parts.push(`Hoy eso vive en ${tools.join(', ')}.`);
  }

  return parts.join(' ');
}

/**
 * Topes de longitud del cuerpo del correo.
 *
 * El cuerpo viaja dentro de un `mailto:`, es decir, dentro de una URL. Varios
 * gestores de correo —los de Windows entre ellos— truncan la dirección o se
 * niegan a abrirla por encima de unos 2 KB, y sin ningún aviso: el usuario ve
 * un borrador vacío o mutilado. Tres de las preguntas son `textarea` sin
 * límite, así que el caso que importa —alguien que se explaya, o sea, un
 * cliente interesado— es justo el que se pasaría.
 *
 * `MAX_ANSWER_LENGTH` evita que una sola respuesta se coma el presupuesto;
 * `MAX_ENCODED_BODY_LENGTH` es el tope de verdad y se mide sobre el texto **ya
 * codificado**, que es como viaja. Medirlo en claro no sirve: la proporción
 * entre uno y otro no es fija —cada espacio y cada acento pasan a ocupar tres
 * caracteres— y un párrafo en español llega a multiplicar por 2,4 su tamaño.
 */
const MAX_ANSWER_LENGTH = 300;
const MAX_ENCODED_BODY_LENGTH = 1600;
/** El asunto comparte URL con el cuerpo: interpola una respuesta y también se acota. */
const MAX_SUBJECT_ANSWER_LENGTH = 80;

/** Marca visible del recorte, para que nadie lo confunda con la respuesta. */
const TRUNCATION_MARK = '… (recortado)';

const clip = (value: string, limit: number): string =>
  value.length > limit ? `${value.slice(0, limit)}${TRUNCATION_MARK}` : value;

/** Recorta el cuerpo hasta que quepa codificado. Converge en pocas vueltas. */
function fitEncoded(body: string): string {
  let text = body;
  while (text.length > 0 && encodeURIComponent(text).length > MAX_ENCODED_BODY_LENGTH) {
    text = text.slice(0, Math.floor(text.length * 0.9));
  }
  return text === body ? body : `${text}${TRUNCATION_MARK}`;
}

/**
 * Asunto del correo de contacto.
 *
 * Vive aquí y no en el componente porque comparte el presupuesto de la URL con
 * el cuerpo: interpola la respuesta de «empresa», que es un campo libre, y sin
 * acotarla se llevaba por delante el margen que el cuerpo ya respetaba.
 */
export function buildMailSubject(answers: Readonly<Record<string, Answer>>): string {
  const company = String(answers['empresa'] ?? '');
  return `Agendar diagnóstico AVIX — ${clip(company, MAX_SUBJECT_ANSWER_LENGTH)}`;
}

/** Cuerpo del correo de contacto: todas las respuestas en texto plano. */
export function buildMailBody(
  answers: Readonly<Record<string, Answer>>,
  campaign: Readonly<Record<string, string>>,
): string {
  const lines = Object.entries(answers).map(
    ([key, value]) =>
      `${key}: ${clip(Array.isArray(value) ? value.join(', ') : value, MAX_ANSWER_LENGTH)}`,
  );
  const campaignLines = Object.entries(campaign)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`);

  return fitEncoded([...lines, ...campaignLines].join('\n'));
}
