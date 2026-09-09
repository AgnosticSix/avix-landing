'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Efecto de descifrado sobre un texto ya renderizado.
 *
 * El texto real permanece en el DOM y conserva la geometría de la línea; los
 * glifos aleatorios se pintan en una capa superpuesta y absolutamente
 * posicionada. Así el título es legible para buscadores y lectores de pantalla,
 * y el efecto no provoca ningún salto de composición mientras corre.
 */

const SCRAMBLE_GLYPHS = 'abcdeghknopqsuvxyz0123456789#=+';
const DEFAULT_DURATION_MS = 1000;

/**
 * Parte el texto en palabras y en los espacios que las separan, conservando
 * ambos: los espacios se reinsertan tal cual para no alterar la línea.
 *
 * Lleva `g` y sólo puede consumirse con `String.prototype.match`, que reinicia
 * `lastIndex`. Con `test` o `exec` el índice sobreviviría entre llamadas y a
 * partir de la segunda palabra empezaría a saltarse trozos.
 */
const TOKEN_PATTERN = /\S+|\s+/g;
/** Sin `g`: se usa con `test`, así que no arrastra estado. */
const WHITESPACE_PATTERN = /\s/;

interface Word {
  readonly base: HTMLElement;
  readonly overlay: HTMLElement;
  readonly text: string;
  /** Índice del primer carácter dentro del texto completo. */
  readonly start: number;
}

/**
 * Divide el contenido en palabras envueltas, cada una con su capa superpuesta.
 * Se hace una sola vez por elemento y se reutiliza en repeticiones del efecto.
 */
function buildWords(element: HTMLElement, text: string): Word[] {
  const words: Word[] = [];
  element.textContent = '';
  let cursor = 0;

  for (const token of text.match(TOKEN_PATTERN) ?? []) {
    if (WHITESPACE_PATTERN.test(token)) {
      element.appendChild(document.createTextNode(token));
      cursor += token.length;
      continue;
    }

    const wrapper = document.createElement('span');
    wrapper.style.cssText = 'position:relative; display:inline-block; white-space:nowrap;';

    const base = document.createElement('span');
    base.textContent = token;
    wrapper.appendChild(base);

    const overlay = document.createElement('span');
    overlay.style.cssText =
      'position:absolute; left:0; top:0; white-space:nowrap; pointer-events:none; visibility:hidden;';
    overlay.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(overlay);

    element.appendChild(wrapper);
    words.push({ base, overlay, text: token, start: cursor });
    cursor += token.length;
  }

  return words;
}

export interface ScrambleOptions {
  /** Retardo antes de arrancar, en milisegundos. */
  readonly delayMs?: number;
  readonly durationMs?: number;
  /** Si es `false`, el texto se muestra tal cual y el efecto no corre. */
  readonly enabled?: boolean;
}

/**
 * @param ref      Elemento cuyo texto se descifrará.
 * @param text     Texto final. Debe coincidir con el contenido renderizado.
 * @returns Una función para relanzar el efecto (por ejemplo, al pasar el ratón).
 */
export function useScramble(
  ref: RefObject<HTMLElement | null>,
  text: string,
  { delayMs = 0, durationMs = DEFAULT_DURATION_MS, enabled = true }: ScrambleOptions = {},
): () => void {
  const wordsRef = useRef<Word[] | null>(null);
  const runIdRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const run = (delay: number): void => {
    const element = ref.current;
    if (!element || !enabled) return;

    wordsRef.current ??= buildWords(element, text);
    const words = wordsRef.current;

    const runId = (runIdRef.current += 1);
    const startAt = performance.now() + delay;
    const totalLength = text.length;

    const paintOverlay = (visible: boolean): void => {
      for (const word of words) {
        word.base.style.visibility = visible ? 'hidden' : '';
        word.overlay.style.visibility = visible ? '' : 'hidden';
      }
    };

    const step = (now: number): void => {
      if (runIdRef.current !== runId) return;

      const progress = Math.min(1, Math.max(0, (now - startAt) / durationMs));
      if (progress <= 0) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      paintOverlay(true);
      const revealed = Math.floor(progress * totalLength);

      for (const word of words) {
        let output = '';
        for (let index = 0; index < word.text.length; index += 1) {
          const globalIndex = word.start + index;
          const settled = globalIndex < revealed;
          // Aun antes de fijarse, la mitad de los glifos muestra el correcto:
          // el texto se «resuelve» de forma gradual en vez de saltar de golpe.
          output +=
            settled || Math.random() < 0.5
              ? (word.text[index] ?? '')
              : (SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)] ?? '');
        }
        word.overlay.textContent = output;
      }

      if (progress < 1) frameRef.current = requestAnimationFrame(step);
      else paintOverlay(false);
    };

    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!enabled) return;

    // Con la fuente aún sin cargar el efecto mediría anchos equivocados.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    let cancelled = false;
    void fontsReady.then(() => {
      if (!cancelled) run(delayMs);
    });

    return () => {
      cancelled = true;
      runIdRef.current += 1;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // `run` se recrea en cada render pero sólo lee refs; las dependencias reales
    // son las que determinan *cuándo* debe arrancar el efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs, durationMs, enabled, text]);

  return () => run(0);
}
