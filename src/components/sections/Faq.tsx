import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { FAQ_ENTRIES } from '@/content/faq';

import styles from './Faq.module.css';

/**
 * Preguntas frecuentes.
 *
 * Se usa `<details>`/`<summary>` nativo: funciona sin JavaScript, ya es
 * accesible por teclado y su contenido queda en el HTML aunque esté plegado,
 * de modo que los buscadores lo indexan.
 */
export function Faq() {
  return (
    <Section id="faq" className={styles.section}>
      <div className={styles.split}>
        <div>
          <Eyebrow>Preguntas frecuentes</Eyebrow>
          <Reveal delay={0.1} as="h2" className={styles.heading}>
            Lo que casi todos preguntan primero.
          </Reveal>
        </div>

        <Reveal delay={0.2} className={styles.list}>
          {FAQ_ENTRIES.map(({ question, answer }) => (
            <details key={question} className={styles.entry}>
              <summary className={styles.question}>
                {question}
                <span className={styles.toggle} aria-hidden="true">
                  +
                </span>
              </summary>
              <p className={styles.answer}>{answer}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
