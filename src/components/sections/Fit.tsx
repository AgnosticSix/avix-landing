import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { FIT_SIGNALS, NOT_A_FIT } from '@/content/fit';

import styles from './Fit.module.css';

/**
 * «¿Cuándo tiene sentido?» — las señales de que hay algo que automatizar y,
 * junto a ellas, el caso en que no lo hay.
 */
export function Fit() {
  return (
    <Section id="cuando">
      <div className={styles.split}>
        <div>
          <Eyebrow>¿Cuándo tiene sentido?</Eyebrow>

          <Reveal delay={0.1} as="h2" className={styles.heading}>
            AVIX tiene sentido cuando…
          </Reveal>

          <Reveal delay={0.2} className={styles.disclaimer}>
            <h3 className={styles.disclaimerTitle}>{NOT_A_FIT.title}</h3>
            <p className={styles.disclaimerBody}>{NOT_A_FIT.description}</p>
          </Reveal>
        </div>

        <Reveal delay={0.2} as="ul" className={styles.signals}>
          {FIT_SIGNALS.map((signal) => (
            <li key={signal} className={styles.signal}>
              <span className={styles.signalDot} aria-hidden="true" />
              {signal}
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
