/**
 * Geometría del isotipo de AVIX: un cubo central con seis brazos ortogonales,
 * cada uno rematado por otro cubo, más una nube de cubos satélite.
 *
 * Las posiciones están deliberadamente fuera de eje ("ramas orgánicas"): evitan
 * los ángulos rectos perfectos para que el conjunto no se lea como un diagrama.
 * Este módulo sólo describe la forma — no conoce Three.js ni el renderizador.
 */

/** Identificador de cada nodo: centro, arriba/abajo y los cuatro laterales. */
export type NodeId = 'C' | 'T' | 'B' | 'XP' | 'XN' | 'ZP' | 'ZN';

export type Vec3 = readonly [x: number, y: number, z: number];

/** Paleta del isotipo. Se mantienen los hex originales de la marca. */
export const PALETTE = {
  navy: 0x2f4a73,
  slate: 0x3d4a57,
  dark: 0x27313c,
  cyan: 0x0f93a8,
  /** Cian de emisión/brillo, más saturado que el cian base. */
  glow: 0x00d1ff,
  /** Fondo de la página; alimenta la niebla de la escena. */
  background: 0x050b14,
} as const;

export const NODE_POSITIONS: Readonly<Record<NodeId, Vec3>> = {
  C: [0, 0, 0],
  T: [0.9, 6.1, -0.7],
  B: [-0.8, -5.9, 0.9],
  XP: [6.2, 1.1, 0.8],
  XN: [-5.9, -0.9, -1.0],
  ZP: [0.7, -1.2, 6.0],
  ZN: [-1.1, 1.3, -5.8],
};

export const NODE_SIZES: Readonly<Record<NodeId, number>> = {
  C: 1.5,
  T: 1.9,
  B: 1.9,
  XP: 2.0,
  XN: 2.0,
  ZP: 1.8,
  ZN: 1.8,
};

export const NODE_COLORS: Readonly<Record<NodeId, number>> = {
  C: PALETTE.cyan,
  T: PALETTE.slate,
  B: PALETTE.navy,
  XP: PALETTE.navy,
  XN: PALETTE.slate,
  ZP: PALETTE.dark,
  ZN: PALETTE.navy,
};

/** Aristas del isotipo: los seis brazos que salen del centro. */
export const EDGES: readonly (readonly [NodeId, NodeId])[] = [
  ['C', 'T'],
  ['C', 'B'],
  ['C', 'XP'],
  ['C', 'XN'],
  ['C', 'ZP'],
  ['C', 'ZN'],
];

/**
 * Arista que la luz recorre en cada tramo de scroll. El índice corresponde a la
 * sección visible (0–5), de modo que avanzar por la página recorre el isotipo.
 */
export const SCROLL_SEGMENTS: readonly (readonly [NodeId, NodeId])[] = [
  ['C', 'T'],
  ['C', 'XN'],
  ['C', 'ZP'],
  ['C', 'XP'],
  ['C', 'ZN'],
  ['C', 'B'],
];

/**
 * Índice del último tramo: el recorrido de la cámara va de 0 a este valor.
 *
 * Lo consumen tanto la escena como el bucle de scroll. Se deriva de
 * `SCROLL_SEGMENTS` a propósito — escrito a mano, añadir un tramo dejaría el
 * nuevo fuera del recorrido sin que nada fallara.
 */
export const LAST_SCROLL_SEGMENT = SCROLL_SEGMENTS.length - 1;

/** Cubos satélite flotantes: `[x, y, z, escala, color]`. */
export const SATELLITES: readonly (readonly [number, number, number, number, number])[] = [
  [3.2, 4.6, -2.4, 0.55, PALETTE.slate],
  [-3.4, 4.2, 2.2, 0.5, PALETTE.navy],
  [-5.2, -3.6, -2.6, 0.6, PALETTE.dark],
  [5.0, -4.2, 2.8, 0.5, PALETTE.slate],
  [2.6, -2.2, -5.2, 0.45, PALETTE.navy],
  [-2.4, 2.0, 5.0, 0.5, PALETTE.cyan],
];

/** Lista de adyacencia derivada de `EDGES`. */
const ADJACENCY: Readonly<Record<NodeId, readonly NodeId[]>> = EDGES.reduce(
  (acc, [a, b]) => {
    acc[a] = [...(acc[a] ?? []), b];
    acc[b] = [...(acc[b] ?? []), a];
    return acc;
  },
  {} as Record<NodeId, NodeId[]>,
);

/**
 * Camino más corto entre dos nodos (BFS sobre el grafo del isotipo).
 *
 * El grafo es una estrella de siete nodos, así que el camino nunca pasa de tres
 * saltos; se recalcula en cada cambio de sección y no merece memoización.
 *
 * @returns La secuencia de nodos incluyendo origen y destino.
 */
export function shortestPath(from: NodeId, to: NodeId): NodeId[] {
  if (from === to) return [from];

  const previous = new Map<NodeId, NodeId>();
  const visited = new Set<NodeId>([from]);
  const queue: NodeId[] = [from];

  while (queue.length > 0) {
    const current = queue.shift() as NodeId;

    for (const neighbour of ADJACENCY[current] ?? []) {
      if (visited.has(neighbour)) continue;
      visited.add(neighbour);
      previous.set(neighbour, current);

      if (neighbour === to) {
        const path: NodeId[] = [to];
        while (path[0] !== from) path.unshift(previous.get(path[0] as NodeId) as NodeId);
        return path;
      }
      queue.push(neighbour);
    }
  }

  // El grafo es conexo por construcción; esto sólo protege ante una arista mal editada.
  return [from, to];
}

export const NODE_IDS = Object.keys(NODE_POSITIONS) as NodeId[];
