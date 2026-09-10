import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { PROCESS_STEPS } from '@/content/process';

import styles from './Process.module.css';

/** «Cómo empezamos» — diagnóstico antes que tecnología. */
export function Process() {
  return (
    <Section id="como-empezamos" className={styles.section}>
      <Eyebrow>Cómo empezamos</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        Primero entendemos. <span className={styles.headingHighlight}>Después automatizamos.</span>
      </Reveal>

      <Reveal delay={0.2} className={styles.grid}>
        {PROCESS_STEPS.map(({ title, description }, index) => (
          <article key={title} className={styles.card}>
            <div className={styles.index} aria-hidden="true">
              {index + 1}
            </div>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardBody}>{description}</p>
          </article>
        ))}
      </Reveal>

      <Reveal delay={0.2} as="p" className={styles.closing}>
        No te vendemos un agente porque esté de moda. Primero encontramos qué problema vale la pena
        resolver.
      </Reveal>
    </Section>
  );
}
