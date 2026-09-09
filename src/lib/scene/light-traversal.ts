import { clamp01, smoothstep } from '@/lib/math';

import { SCROLL_SEGMENTS, shortestPath, type NodeId } from './isotype';

/**
 * Máquina de estados de la luz que recorre el isotipo.
 *
 * La luz alterna entre `hold` (parada e iluminando un nodo) y `travel`
 * (desplazándose por una arista). El scroll no la mueve directamente: fija el
 * *tramo objetivo*, y la luz navega hasta él por el camino más corto. Así el
 * movimiento sigue siendo continuo aunque el usuario salte de sección.
 */

/** Milisegundos que la luz permanece detenida en un nodo. */
const HOLD_MS = 480;
/** Milisegundos que tarda en recorrer una arista. */
const TRAVEL_MS = 1150;

export type TraversalPhase = 'hold' | 'travel';

export interface TraversalState {
  readonly from: NodeId;
  readonly to: NodeId;
  readonly phase: TraversalPhase;
  /** Progreso suavizado dentro de la arista, de 0 a 1. En `hold` siempre es 0. */
  readonly progress: number;
}

export interface LightTraversal {
  readonly state: TraversalState;
  /** Fija el tramo objetivo (índice de sección, 0–5). Idempotente. */
  targetSegment(index: number): void;
  /** Avanza la máquina de estados. */
  advance(deltaMs: number): void;
}

export function createLightTraversal(): LightTraversal {
  let from: NodeId = 'C';
  let to: NodeId = 'C';
  let phase: TraversalPhase = 'hold';
  let elapsedMs = 0;
  let segmentIndex = -1;
  let endpointA: NodeId = 'C';
  let endpointB: NodeId = 'T';
  let queue: NodeId[] = [];

  const nextTarget = (): NodeId => {
    const queued = queue.shift();
    if (queued) return queued;
    if (from === endpointA) return endpointB;
    if (from === endpointB) return endpointA;
    return endpointA;
  };

  return {
    get state(): TraversalState {
      return {
        from,
        to,
        phase,
        progress: phase === 'travel' ? smoothstep(clamp01(elapsedMs / TRAVEL_MS)) : 0,
      };
    },

    targetSegment(index: number): void {
      const clamped = Math.max(0, Math.min(SCROLL_SEGMENTS.length - 1, index));
      if (clamped === segmentIndex) return;
      segmentIndex = clamped;

      const segment = SCROLL_SEGMENTS[clamped];
      if (!segment) return;
      [endpointA, endpointB] = segment;

      // Se navega desde donde la luz acabará realmente, no desde donde está:
      // si va en movimiento, su origen efectivo es el nodo de destino.
      const anchor = phase === 'travel' ? to : from;
      const toA = shortestPath(anchor, endpointA);
      const toB = shortestPath(anchor, endpointB);
      queue = (toA.length <= toB.length ? toA : toB).slice(1);
    },

    advance(deltaMs: number): void {
      elapsedMs += deltaMs;

      if (phase === 'hold' && elapsedMs >= HOLD_MS) {
        to = nextTarget();
        phase = 'travel';
        elapsedMs = 0;
        return;
      }

      if (phase === 'travel' && elapsedMs >= TRAVEL_MS) {
        from = to;
        phase = 'hold';
        elapsedMs = 0;
      }
    },
  };
}
