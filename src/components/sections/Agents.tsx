import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { AGENT_BOUNDARIES, AGENT_FLOW, AGENT_TASKS } from '@/content/agents';

import styles from './Agents.module.css';

/**
 * «Agentes de IA» — qué es un agente, qué hace y, sobre todo, dónde se detiene.
 *
 * La segunda mitad de la sección existe para responder a la objeción implícita
 * («¿y si hace algo que no debe?»), de ahí que los límites tengan tanto peso
 * visual como las capacidades.
 */
export function Agents() {
  return (
    <Section id="agentes" className={styles.section}>
      <Eyebrow>Agentes de IA</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        Piensa en un agente de IA como un asistente digital especializado.
      </Reveal>

      <Reveal delay={0.2} className={styles.split}>
        <div>
          <p className={styles.lead}>No es un chatbot que espera preguntas.</p>
          <p className={styles.support}>
            Es una IA preparada para hacer una tarea específica dentro de tu empresa.
          </p>

          <div className={styles.listLabel}>Puede</div>
          <ul className={styles.tasks}>
            {AGENT_TASKS.map(({ text, escalates }) => (
              <li key={text} className={styles.task}>
                <span
                  className={escalates ? styles.taskDotEscalates : styles.taskDot}
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>

          <p className={styles.pullQuote}>
            Y cuando llega a algo que no debe decidir sola, se detiene y llama a una persona.
          </p>
        </div>

        <ol className={styles.flow}>
          {AGENT_FLOW.map(({ title, detail, handsOff }, index) => (
            <li key={title} className={handsOff ? styles.flowStepHandsOff : styles.flowStep}>
              <span
                className={handsOff ? styles.flowIndexHandsOff : styles.flowIndex}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <div className={styles.flowTitle}>{title}</div>
                <div className={styles.flowDetail}>{detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.2} as="h2" className={styles.boundariesHeading}>
        La IA hace el trabajo repetitivo. Tu equipo conserva el criterio.
      </Reveal>

      <Reveal delay={0.2} className={styles.boundariesPanel}>
        <div>
          <h3 className={styles.boundariesTitle}>
            La IA no recibe permiso para hacer lo que quiera.
          </h3>
          <p className={styles.boundariesIntro}>
            Antes de poner cualquier automatización en operación definimos:
          </p>
          <p className={styles.boundariesClosing}>Automatización sin perder responsabilidad.</p>
        </div>

        <ul className={styles.boundaryList}>
          {AGENT_BOUNDARIES.map(({ text, critical }, index) => (
            <li key={text} className={critical ? styles.boundaryCritical : styles.boundary}>
              <span
                className={critical ? styles.boundaryIndexCritical : styles.boundaryIndex}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
