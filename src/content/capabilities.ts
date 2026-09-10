/** Lo que AVIX puede construir, según el caso de cada empresa. */
export interface Capability {
  readonly title: string;
  readonly description: string;
}

export const CAPABILITIES: readonly Capability[] = [
  {
    title: 'Conectar las herramientas que ya utilizas',
    description: 'Para que la información no tenga que copiarse manualmente entre sistemas.',
  },
  {
    title: 'Crear software cuando lo que existe no alcanza',
    description:
      'Portales, CRM, expedientes, inventarios, tableros o herramientas hechas alrededor de tu operación.',
  },
  {
    title: 'Automatizar tareas repetitivas',
    description:
      'Seguimientos, avisos, captura, clasificación, validación, reportes y tareas administrativas.',
  },
  {
    title: 'Agregar IA donde realmente aporta',
    description:
      'Para leer, resumir, clasificar, investigar, preparar información o detectar pendientes.',
  },
  {
    title: 'Hacer que diferentes procesos trabajen juntos',
    description:
      'Para que una tarea pueda avanzar de un sistema o persona al siguiente sin perder contexto.',
  },
  {
    title: 'Mostrarte qué está pasando',
    description: 'Para saber qué avanzó, qué falta, quién debe actuar y dónde hay un problema.',
  },
];
