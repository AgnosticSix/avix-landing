/**
 * Regulador adaptativo de resolución.
 *
 * Mide el coste medio de fotograma y sube o baja un factor de escala sobre el
 * `devicePixelRatio`. La escena es un fondo decorativo: es preferible perder
 * nitidez a robarle fotogramas al scroll de la página.
 */

const WARMUP_SECONDS = 2.2;
const SAMPLE_COUNT = 40;
const SAMPLE_WINDOW_SECONDS = 0.9;

/** Por encima de este coste medio por fotograma se baja la resolución. */
const DEGRADE_THRESHOLD_SECONDS = 0.023;
/** Por debajo de este coste hay margen para recuperarla. */
const RECOVER_THRESHOLD_SECONDS = 0.0138;
/** Coste tan alto que conviene recortar de golpe en vez de gradualmente. */
const SEVERE_THRESHOLD_SECONDS = 0.05;

const MIN_SCALE = 0.55;
const MAX_SCALE = 1;

export interface PerformanceGovernor {
  /** Factor de escala actual sobre el `devicePixelRatio`, entre 0,55 y 1. */
  readonly scale: number;
  /**
   * Registra un fotograma.
   * @returns `true` si la escala cambió y hay que reaplicar la resolución.
   */
  sample(deltaMs: number): boolean;
}

export function createPerformanceGovernor(): PerformanceGovernor {
  let scale = MAX_SCALE;
  let elapsedSeconds = 0;
  let accumulatedSeconds = 0;
  let sampleCount = 0;

  return {
    get scale(): number {
      return scale;
    },

    sample(deltaMs: number): boolean {
      const deltaSeconds = deltaMs / 1000;
      elapsedSeconds += deltaSeconds;

      // Los primeros segundos incluyen compilación de shaders y subida de
      // texturas; medirlos degradaría la resolución sin motivo.
      if (elapsedSeconds <= WARMUP_SECONDS) return false;

      accumulatedSeconds += deltaSeconds;
      sampleCount += 1;
      if (sampleCount < SAMPLE_COUNT && accumulatedSeconds <= SAMPLE_WINDOW_SECONDS) return false;

      const averageSeconds = accumulatedSeconds / sampleCount;
      accumulatedSeconds = 0;
      sampleCount = 0;

      if (averageSeconds > DEGRADE_THRESHOLD_SECONDS && scale > MIN_SCALE) {
        const factor = averageSeconds > SEVERE_THRESHOLD_SECONDS ? 0.64 : 0.85;
        scale = Math.max(MIN_SCALE, scale * factor);
        return true;
      }

      if (averageSeconds < RECOVER_THRESHOLD_SECONDS && scale < MAX_SCALE) {
        scale = Math.min(MAX_SCALE, scale + 0.08);
        return true;
      }

      return false;
    },
  };
}

/**
 * Techo de `devicePixelRatio` según el dispositivo. Los móviles y las máquinas
 * con pocos núcleos arrancan con un techo más bajo para no depender sólo del
 * regulador, que necesita unos segundos para reaccionar.
 */
export function resolvePixelRatioCap(): number {
  const isLowPower =
    /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) ||
    (navigator.hardwareConcurrency ?? 8) <= 4;
  return isLowPower ? 1.4 : 1.8;
}
