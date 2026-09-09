/**
 * Los dos socios.
 *
 * `portrait` apunta a la fotografía en `public/`. Mientras no exista, se
 * muestra un marcador con las iniciales: ver `Team.tsx`.
 */
export interface Partner {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly credentials: string;
  readonly portrait?: string;
}

export const PARTNERS: readonly Partner[] = [
  {
    name: 'Alex',
    role: 'Operación y negocio',
    bio: 'Entiende cómo trabaja tu empresa, detecta dónde se pierde tiempo y convierte el proceso en reglas claras.',
    credentials: 'Maestría en Marketing Digital e Inteligencia Artificial.',
  },
  {
    name: 'Mat',
    role: 'Tecnología y sistemas',
    bio: 'Convierte esas reglas en software, automatizaciones, integraciones y sistemas de IA.',
    credentials:
      'Maestría en Ingeniería de Software y Sistemas Informáticos. Certificación en infraestructura cloud.',
  },
];
