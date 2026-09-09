/**
 * Contenido de la sección «Agentes de IA»: qué es un agente, qué puede hacer,
 * cómo trabaja y qué límites se le fijan antes de ponerlo en operación.
 */

export interface AgentTask {
  readonly text: string;
  /** La tarea implica avisar a una persona: se marca en cobre, no en cian. */
  readonly escalates?: boolean;
}

export const AGENT_TASKS: readonly AgentTask[] = [
  { text: 'Leer una solicitud y clasificarla' },
  { text: 'Revisar documentos y detectar qué falta' },
  { text: 'Dar seguimiento a clientes o proveedores' },
  { text: 'Preparar una cotización o un borrador' },
  { text: 'Consultar información autorizada' },
  { text: 'Actualizar registros' },
  { text: 'Crear recordatorios' },
  { text: 'Preparar reportes' },
  { text: 'Avisar cuando algo necesita atención', escalates: true },
];

export interface AgentFlowStep {
  readonly title: string;
  readonly detail: string;
  /** El último paso devuelve el control a una persona: se destaca en cobre. */
  readonly handsOff?: boolean;
}

export const AGENT_FLOW: readonly AgentFlowStep[] = [
  { title: 'Recibe la tarea', detail: '“Revisa esta solicitud y dime qué falta.”' },
  { title: 'Trabaja', detail: 'Lee, compara con lo que se requiere, encuentra el faltante.' },
  { title: 'Registra lo que hizo', detail: 'Queda historial: qué revisó, qué pidió y cuándo.' },
  {
    title: 'Pide una decisión si hace falta',
    detail: '“Este caso sale de lo normal. ¿Lo apruebas?”',
    handsOff: true,
  },
];

export interface Boundary {
  readonly text: string;
  /** El último límite es innegociable y se resalta. */
  readonly critical?: boolean;
}

/** Lo que se define antes de poner una automatización en marcha. */
export const AGENT_BOUNDARIES: readonly Boundary[] = [
  { text: 'Qué puede hacer' },
  { text: 'Qué información puede utilizar' },
  { text: 'Qué acciones debe registrar' },
  { text: 'Cuándo debe detenerse' },
  { text: 'Qué decisiones siempre pertenecen a una persona', critical: true },
];
