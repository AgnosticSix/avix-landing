import { ELEMENT_IDS } from '@/lib/element-ids';

import styles from './Backdrop.module.css';

/**
 * Capas decorativas de fondo, de atrás hacia delante: degradados, retícula
 * neuronal, humo de profundidad, canvas 3D y niebla en primer plano.
 *
 * Es marcado estático (componente de servidor). Los elementos animados llevan
 * un `id` de `ELEMENT_IDS` porque quien los mueve es `useScrollScene`, no React.
 */

/** Vértices de la retícula, en coordenadas del `viewBox`. */
const NEURAL_ROWS: readonly (readonly (readonly [number, number])[])[] = [
  [
    [80, 120],
    [340, 60],
    [620, 150],
    [920, 80],
    [1240, 140],
    [1520, 90],
  ],
  [
    [180, 420],
    [480, 330],
    [760, 460],
    [1060, 360],
    [1360, 430],
    [1560, 520],
  ],
  [
    [120, 720],
    [420, 820],
    [700, 680],
    [1000, 780],
    [1300, 700],
    [1540, 840],
  ],
];

/** Aristas de la retícula: tres horizontales y cinco verticales que las cosen. */
const NEURAL_EDGES: readonly string[] = [
  'M 80 120 L 340 60 L 620 150 L 920 80 L 1240 140 L 1520 90',
  'M 180 420 L 480 330 L 760 460 L 1060 360 L 1360 430 L 1560 520',
  'M 120 720 L 420 820 L 700 680 L 1000 780 L 1300 700 L 1540 840',
  'M 340 60 L 480 330 L 420 820',
  'M 920 80 L 760 460 L 700 680',
  'M 1240 140 L 1060 360 L 1000 780',
  'M 80 120 L 180 420 L 120 720',
  'M 1520 90 L 1360 430 L 1300 700',
  'M 1560 520 L 1300 700',
];

/** Circuito cerrado que recorre el pulso cobrizo. */
const NEURAL_ROUTE =
  'M 80 120 L 340 60 L 480 330 L 760 460 L 1060 360 L 1240 140 L 1520 90 L 1360 430 ' +
  'L 1560 520 L 1300 700 L 1000 780 L 700 680 L 420 820 L 120 720 L 180 420 Z';

export function Backdrop() {
  return (
    <>
      <div className={styles.gradients} aria-hidden="true" />

      <svg
        id={ELEMENT_IDS.neural}
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className={styles.neural}
        aria-hidden="true"
      >
        <defs>
          <filter id="neural-blur" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        <g stroke="rgba(0,188,212,.13)" strokeWidth="1.1" fill="none">
          {NEURAL_EDGES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        <g fill="rgba(0,188,212,.32)">
          {NEURAL_ROWS.flat().map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" />
          ))}
        </g>

        <path id={ELEMENT_IDS.neuralRoute} d={NEURAL_ROUTE} fill="none" stroke="none" />
        <circle
          id={ELEMENT_IDS.neuralPulseGlow}
          r="11"
          fill="rgba(205,127,50,.6)"
          filter="url(#neural-blur)"
        />
        <circle id={ELEMENT_IDS.neuralPulse} r="3.5" fill="#CD7F32" />
      </svg>

      <div className={styles.depthSmoke} aria-hidden="true">
        <div className={styles.smokeBlobA} />
        <div className={styles.smokeBlobB} />
      </div>

      <canvas id={ELEMENT_IDS.canvas} className={styles.canvas} aria-hidden="true" />

      <div className={styles.fog} aria-hidden="true">
        <div className={styles.fogBlobA} />
        <div className={styles.fogBlobB} />
        <div className={styles.vignette} />
        <div className={styles.grain} />
      </div>
    </>
  );
}
