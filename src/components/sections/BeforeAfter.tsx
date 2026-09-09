'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { BEFORE_AFTER_OUTCOMES, LANES, type Lane, type LaneStep } from '@/content/before-after';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { track } from '@/lib/analytics';

import styles from './BeforeAfter.module.css';

/** Milisegundos entre el encendido de un paso y el siguiente. */
const STEP_INTERVAL_MS = 1100;
/** Proporción de la sección visible que dispara la reproducción automática. */
const AUTOPLAY_THRESHOLD = 0.3;

const STEP_COUNT = Math.max(...LANES.map((lane) => lane.steps.length));

type Tone = 'manual' | 'ai' | 'human';

function toneFor(lane: Lane, step: LaneStep): Tone {
  if (lane.key === 'manual') return 'manual';
  return step.human ? 'human' : 'ai';
}

/**
 * Comparación animada entre el proceso manual y el automatizado.
 *
 * Los pasos se encienden de uno en uno y en paralelo en ambos carriles, de modo
 * que se lee cuánto trabajo desaparece. Arranca sola al entrar en pantalla y
 * puede repetirse con el botón.
 *
 * El estado es un único índice —el último paso encendido— y el resto es CSS:
 * no hace falta más para una animación que sólo avanza.
 */
export function BeforeAfter() {
  const [litUpTo, setLitUpTo] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const play = useCallback(() => {
    // Con movimiento reducido se muestra el resultado final sin animar.
    if (reducedMotion) {
      setLitUpTo(STEP_COUNT - 1);
      setPlaying(false);
      return;
    }

    clearTimers();
    setPlaying(true);
    setLitUpTo(-1);

    for (let step = 0; step < STEP_COUNT; step += 1) {
      timersRef.current.push(setTimeout(() => setLitUpTo(step), step * STEP_INTERVAL_MS));
    }
    timersRef.current.push(
      setTimeout(() => setPlaying(false), STEP_COUNT * STEP_INTERVAL_MS + 500),
    );
  }, [clearTimers, reducedMotion]);

  // Arranca una sola vez, cuando la sección entra en pantalla.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        play();
      },
      { threshold: AUTOPLAY_THRESHOLD },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [play]);

  useEffect(() => clearTimers, [clearTimers]);

  const onReplay = (): void => {
    track('demo_interaction', { label: 'Ver de nuevo' });
    play();
  };

  return (
    <Section id="antes-despues" className={styles.section}>
      <div ref={sectionRef}>
        <Eyebrow>Antes / Después</Eyebrow>

        <div className={styles.header}>
          <Reveal delay={0.1} as="h2" className={styles.heading}>
            De perseguir tareas a tener un sistema que las mueve.
          </Reveal>
          <button type="button" className={styles.replay} onClick={onReplay}>
            <span className={styles.replayIcon} aria-hidden="true" />
            Ver de nuevo
          </button>
        </div>

        <Reveal delay={0.2} className={styles.lanes}>
          {LANES.map((lane) => (
            <div key={lane.key} className={lane.key === 'avix' ? styles.laneAvix : styles.lane}>
              <div className={lane.key === 'avix' ? styles.laneTitleAvix : styles.laneTitle}>
                {lane.title}
              </div>
              <ol className={styles.steps}>
                {lane.steps.map((step, index) => (
                  <li
                    key={step.text}
                    className={step.human ? styles.stepHuman : styles.step}
                    data-lit={index <= litUpTo}
                    data-tone={toneFor(lane, step)}
                  >
                    <span
                      className={step.human ? styles.dotHuman : styles.dot}
                      aria-hidden="true"
                    />
                    <span>
                      {step.text}
                      {step.emphasis && (
                        <strong className={styles.emphasis}>{step.emphasis}</strong>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.25}>
          <div className={styles.outcomes} data-playing={playing}>
            {BEFORE_AFTER_OUTCOMES.map(({ text, highlight }) => (
              <span key={text} className={highlight ? styles.outcomeHighlight : undefined}>
                {text}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
