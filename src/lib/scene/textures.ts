import { CanvasTexture, RepeatWrapping } from 'three';

const GLOW_TEXTURE_SIZE = 128;
const MATRIX_TEXTURE_SIZE = 160;

function createCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Halo radial usado por los sprites de brillo (nodos, luz viajera y estela).
 * Se comparte entre todos los sprites: es la misma textura en todos los casos.
 */
export function createGlowTexture(innerColor = 'rgba(207,246,252,1)'): CanvasTexture {
  const canvas = createCanvas(GLOW_TEXTURE_SIZE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D para la textura de brillo');

  const half = GLOW_TEXTURE_SIZE / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.3, 'rgba(0,209,255,.5)');
  gradient.addColorStop(1, 'rgba(0,188,212,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);

  return new CanvasTexture(canvas);
}

const GLYPHS = '0123456789ABCDEF<>#{}|/=+';
const COLUMN_COUNT = 10;
const GLYPH_LINE_HEIGHT = 14;
/** Sólo se repinta cada 55 ms: a 60 fps daría un parpadeo ilegible y caro. */
const REDRAW_INTERVAL_MS = 55;

interface GlyphColumn {
  y: number;
  /** Velocidad de caída en píxeles por segundo. */
  speed: number;
  /** Número de glifos visibles en la estela. */
  length: number;
}

/**
 * Textura animada que se proyecta dentro de los cubos cuando se iluminan:
 * lluvia de glifos más una cadena de bloques deslizándose por la base.
 *
 * Es un objeto con estado porque la animación es incremental; `draw` debe
 * llamarse desde el bucle de render con el delta de tiempo del fotograma.
 */
export interface MatrixTexture {
  readonly texture: CanvasTexture;
  /** Avanza la animación. Ignora la llamada si no ha pasado `REDRAW_INTERVAL_MS`. */
  draw(deltaMs: number): void;
  dispose(): void;
}

export function createMatrixTexture(): MatrixTexture {
  const canvas = createCanvas(MATRIX_TEXTURE_SIZE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D para la textura matrix');

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  const columns: GlyphColumn[] = Array.from({ length: COLUMN_COUNT }, () => ({
    y: Math.random() * MATRIX_TEXTURE_SIZE,
    speed: 40 + Math.random() * 90,
    length: 5 + Math.floor(Math.random() * 6),
  }));

  let accumulatedMs = 0;
  let chainOffset = 0;

  const drawGlyphRain = (stepSeconds: number): void => {
    ctx.font = '12px monospace';
    ctx.textBaseline = 'top';

    for (const [index, column] of columns.entries()) {
      column.y += column.speed * stepSeconds;
      if (column.y - column.length * GLYPH_LINE_HEIGHT > MATRIX_TEXTURE_SIZE) {
        column.y = -Math.random() * 60;
        column.speed = 40 + Math.random() * 90;
      }

      for (let row = 0; row < column.length; row += 1) {
        const y = column.y - row * GLYPH_LINE_HEIGHT;
        const alpha = row === 0 ? 1 : (1 - row / column.length) * 0.55;
        ctx.fillStyle = row === 0 ? `rgba(220,252,255,${alpha})` : `rgba(0,214,240,${alpha})`;
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '0', index * 16 + 2, y);
      }
    }
  };

  const drawBlockChain = (stepSeconds: number): void => {
    chainOffset = (chainOffset + stepSeconds * 26) % 34;

    ctx.strokeStyle = 'rgba(0,214,240,.85)';
    ctx.lineWidth = 1.2;
    for (let x = -34 + chainOffset; x < 170; x += 34) {
      ctx.strokeRect(x, 132, 18, 14);
      ctx.beginPath();
      ctx.moveTo(x + 18, 139);
      ctx.lineTo(x + 34, 139);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,214,240,.6)';
      ctx.fillRect(x + 3, 135, 12, 2);
      ctx.fillRect(x + 3, 139, 8, 2);
    }

    ctx.strokeStyle = 'rgba(0,214,240,.35)';
    ctx.beginPath();
    ctx.moveTo(0, 126);
    ctx.lineTo(MATRIX_TEXTURE_SIZE, 126);
    ctx.stroke();
  };

  return {
    texture,
    draw(deltaMs: number): void {
      accumulatedMs += deltaMs;
      if (accumulatedMs < REDRAW_INTERVAL_MS) return;

      const stepSeconds = accumulatedMs / 1000;
      accumulatedMs = 0;

      ctx.clearRect(0, 0, MATRIX_TEXTURE_SIZE, MATRIX_TEXTURE_SIZE);
      drawGlyphRain(stepSeconds);
      drawBlockChain(stepSeconds);
      texture.needsUpdate = true;
    },
    dispose(): void {
      texture.dispose();
    },
  };
}
