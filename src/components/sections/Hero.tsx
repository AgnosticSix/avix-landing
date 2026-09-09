import Link from 'next/link';

import { Fragment } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { siteConfig } from '@/config/site';
import { DISCOVERY_ANCHOR } from '@/content/navigation';
import { FLOW_LEGEND, HERO, HERO_FLOW, type FlowActor } from '@/content/hero';
import { ELEMENT_IDS } from '@/lib/element-ids';

import { ScrambleHeadline } from './ScrambleHeadline';
import styles from './Hero.module.css';

/** Segundos entre el encendido de un paso y el del siguiente, en el ciclo de 10 s. */
const STEP_STAGGER_S = 2;
/** El conector se enciende justo antes que la tarjeta a la que apunta. */
const LINK_OFFSET_S = 1.6;

const KICKER_CLASS: Record<FlowActor, string> = {
  trigger: styles.stepKicker,
  ai: styles.stepKickerAi,
  human: styles.stepKickerHuman,
};

export function Hero() {
  return (
    <header id="inicio" className={styles.hero}>
      <div className={styles.copy}>
        <Reveal className={styles.eyebrow}>
          <span className={styles.eyebrowRule} />
          <span className={styles.eyebrowText}>{HERO.eyebrow}</span>
        </Reveal>

        <Reveal delay={0.12}>
          <ScrambleHeadline
            lead={HERO.headline.lead}
            highlight={HERO.headline.highlight}
            showLoader={siteConfig.featureFlags.showLoader}
            className={styles.headline}
            highlightClassName={styles.headlineHighlight}
          />
        </Reveal>

        <Reveal delay={0.24} as="p" className={styles.lead}>
          {HERO.lead}
        </Reveal>

        <Reveal delay={0.3} as="p" className={styles.support}>
          {HERO.support}
        </Reveal>

        <Reveal delay={0.36} className={styles.actions}>
          <Link id={ELEMENT_IDS.heroCta} href={DISCOVERY_ANCHOR} className={styles.primaryCta}>
            {siteConfig.ctaLabel}
          </Link>
          <Link href="/#te-suena" className={styles.secondaryCta}>
            {HERO.secondaryCta} <span className={styles.secondaryCtaArrow}>↓</span>
          </Link>
        </Reveal>

        <Reveal delay={0.46} className={styles.reassurance}>
          <span className={styles.reassuranceDot} />
          <span className={styles.reassuranceText}>{HERO.reassurance}</span>
        </Reveal>
      </div>

      <div className={styles.flowWrap}>
        <Reveal delay={0.55} className={styles.flowPanel}>
          <div className={styles.flowHeader}>
            <span>Así se ve una tarea que trabaja sola</span>
            <span className={styles.legend}>
              {FLOW_LEGEND.map(({ actor, label }) => (
                <span key={actor}>
                  <span
                    className={actor === 'ai' ? styles.legendDotAi : styles.legendDotHuman}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              ))}
            </span>
          </div>

          <div
            className={styles.flow}
            role="list"
            aria-label="Solicitud entra, IA revisa, actualiza sistema, detecta faltante, una persona recibe el aviso"
          >
            {HERO_FLOW.map((step, index) => (
              <Fragment key={step.title}>
                {index > 0 && (
                  <span
                    className={styles.link}
                    style={{ animationDelay: `${index * STEP_STAGGER_S - LINK_OFFSET_S}s` }}
                    aria-hidden="true"
                  />
                )}
                <div
                  role="listitem"
                  className={step.actor === 'human' ? styles.stepHuman : styles.step}
                  style={{ animationDelay: `${index * STEP_STAGGER_S}s` }}
                >
                  <div className={KICKER_CLASS[step.actor]}>{step.kicker}</div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDetail}>{step.detail}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.65} className={styles.closing}>
          {HERO.closing}
        </Reveal>
      </div>
    </header>
  );
}
