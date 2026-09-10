'use client';

import { useEffect, useReducer, useRef } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { siteConfig } from '@/config/site';
import { DISCOVERY_COPY, QUIZ_QUESTIONS, UTM_PARAMS } from '@/content/quiz';
import { track } from '@/lib/analytics';

import { QuestionView } from './QuestionView';
import {
  QUESTION_COUNT,
  buildMailBody,
  buildMailSubject,
  buildSummary,
  initialQuizState,
  isLastStep,
  isStepValid,
  missingNames,
  quizReducer,
} from './quiz-state';
import styles from './Discovery.module.css';

/** Lee los parámetros de campaña de la URL actual. Vacío fuera del navegador. */
function readCampaignParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const collected: Record<string, string> = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value) collected[key] = value;
  }
  return collected;
}

/**
 * «Descubrir» — cuestionario de diagnóstico paso a paso.
 *
 * No hay servidor detrás: al terminar se compone un `mailto:` con las
 * respuestas. Es deliberado, porque mantiene la landing como sitio estático; el
 * día que haga falta un CRM, el punto a cambiar es `buildMailtoHref`.
 */
export function Discovery() {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const startTracked = useRef(false);

  useEffect(() => {
    if (!state.started || startTracked.current) return;
    startTracked.current = true;
    track('quiz_start');
  }, [state.started]);

  // Se espera a `started` por el mismo motivo que `quiz_start`: sin esa
  // condición el paso 1 se registraría en cada carga de la página, con quiz
  // tocado o sin tocar, y dejaría de servir como referencia de abandono.
  useEffect(() => {
    if (!state.started || state.completed) return;
    track('quiz_step', { step: state.stepIndex + 1 });
  }, [state.started, state.stepIndex, state.completed]);

  const question = QUIZ_QUESTIONS[state.stepIndex];
  const invalid = state.showValidation ? missingNames(state) : [];
  const lastStep = isLastStep(state);

  /**
   * Se compone en el momento de dibujar el resultado, que sólo ocurre en el
   * navegador tras completar el cuestionario. Leer los parámetros de campaña
   * aquí evita mantenerlos en estado sólo para consultarlos una vez.
   */
  const buildMailtoHref = (): string => {
    const subject = buildMailSubject(state.answers);
    const campaign = readCampaignParams();
    const body = buildMailBody(state.answers, campaign);
    return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleAdvance = (): void => {
    if (!lastStep) {
      dispatch({ type: 'next' });
      return;
    }
    // El reductor rechaza `complete` mientras falte alguna respuesta
    // obligatoria. Sin repetir aquí esa comprobación, el evento de conversión
    // contaría los envíos fallidos y los volvería a contar en cada reintento.
    if (isStepValid(state)) {
      track('quiz_complete', {
        personas: String(state.answers['personas'] ?? ''),
        sensible: String(state.answers['sensible'] ?? ''),
      });
    }
    dispatch({ type: 'complete' });
  };

  return (
    <Section id="descubrir" className={styles.section}>
      <div className={styles.halo} aria-hidden="true" />

      <div className={styles.split}>
        <div>
          <Eyebrow>{DISCOVERY_COPY.eyebrow}</Eyebrow>
          <Reveal delay={0.1} as="h2" className={styles.heading}>
            {DISCOVERY_COPY.heading}
          </Reveal>
          <Reveal delay={0.2} as="p" className={styles.lead}>
            {DISCOVERY_COPY.lead}
          </Reveal>
          <Reveal delay={0.25} as="p" className={styles.support}>
            {DISCOVERY_COPY.support}
          </Reveal>
          <Reveal delay={0.3}>
            <a href={`mailto:${siteConfig.contactEmail}`} className={styles.email}>
              {siteConfig.contactEmail}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.2} className={styles.panel}>
          {state.completed ? (
            <div>
              <div className={styles.resultEyebrow}>{DISCOVERY_COPY.resultEyebrow}</div>
              <h3 className={styles.resultHeading}>{DISCOVERY_COPY.resultHeading}</h3>
              <p className={styles.resultBody}>
                {DISCOVERY_COPY.resultLead}{' '}
                <span className={styles.resultSummary}>{buildSummary(state.answers)}</span>{' '}
                {DISCOVERY_COPY.resultClosing}
              </p>
              <a
                href={buildMailtoHref()}
                className={styles.resultCta}
                onClick={() => track('book_click')}
              >
                {DISCOVERY_COPY.resultCta}
              </a>
              <p className={styles.resultDisclaimer}>{DISCOVERY_COPY.resultDisclaimer}</p>
            </div>
          ) : (
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                handleAdvance();
              }}
            >
              <div className={styles.progress}>
                {/* `aria-live` anuncia el avance a quien no ve la barra. */}
                <span role="status" aria-live="polite">
                  Pregunta {state.stepIndex + 1} de {QUESTION_COUNT}
                </span>
                <span className={styles.progressTrack}>
                  <span
                    className={styles.progressBar}
                    style={{ width: `${((state.stepIndex + 1) / QUESTION_COUNT) * 100}%` }}
                  />
                </span>
              </div>

              {question && (
                <QuestionView
                  // Remontar al cambiar de paso reinicia el foco automático.
                  key={question.id}
                  question={question}
                  answers={state.answers}
                  invalid={invalid}
                  dispatch={dispatch}
                  autoFocus={state.stepIndex > 0}
                />
              )}

              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.back}
                  hidden={state.stepIndex === 0}
                  onClick={() => dispatch({ type: 'back' })}
                >
                  ← Anterior
                </button>
                <button type="submit" className={styles.next}>
                  {lastStep ? siteConfig.ctaLabel : 'Siguiente →'}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
