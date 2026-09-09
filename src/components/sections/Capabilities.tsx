import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { CAPABILITIES } from '@/content/capabilities';

import styles from './Capabilities.module.css';

/** «Entonces, ¿qué hace AVIX?» — el catálogo de lo que se puede construir. */
export function Capabilities() {
  return (
    <Section id="que-hace">
      <Eyebrow>Entonces, ¿qué hace AVIX?</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        Convertimos partes de tu operación en sistemas que trabajan contigo.
      </Reveal>

      <Reveal delay={0.2} as="p" className={styles.intro}>
        Dependiendo de tu empresa podemos:
      </Reveal>

      <Reveal delay={0.25} className={styles.grid}>
        {CAPABILITIES.map(({ title, description }) => (
          <article key={title} className={styles.card}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardBody}>{description}</p>
          </article>
        ))}
      </Reveal>

      <Reveal delay={0.2} as="h2" className={styles.closing}>
        No necesitas saber qué tecnología necesitas.{' '}
        <span className={styles.closingHighlight}>Ese diagnóstico lo hacemos nosotros.</span>
      </Reveal>
    </Section>
  );
}
