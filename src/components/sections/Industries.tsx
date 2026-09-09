'use client';

import Link from 'next/link';

import { useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { INDUSTRIES } from '@/content/industries';
import { DISCOVERY_ANCHOR } from '@/content/navigation';
import { track } from '@/lib/analytics';

import styles from './Industries.module.css';

const FIRST_INDUSTRY = INDUSTRIES[0];

/**
 * «¿Dónde podría funcionar?» — ejemplos por sector en pestañas.
 *
 * Se renderizan todos los paneles y se ocultan los inactivos con `hidden`, en
 * lugar de montar sólo el activo: el contenido completo queda en el HTML
 * estático y es indexable, y cambiar de pestaña no provoca reflujo.
 */
export function Industries() {
  const [activeKey, setActiveKey] = useState(FIRST_INDUSTRY.key);

  const selectIndustry = (key: string): void => {
    setActiveKey(key);
    track('vertical_view', { vertical: key });
  };

  return (
    <Section id="ejemplos">
      <Eyebrow>Ejemplos</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        ¿Dónde podría funcionar?
      </Reveal>

      <Reveal delay={0.2}>
        <div className={styles.tablist} role="tablist" aria-label="Sectores">
          {INDUSTRIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={key === activeKey}
              aria-controls={`panel-${key}`}
              className={styles.tab}
              onClick={() => selectIndustry(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.25} className={styles.panelFrame}>
        {INDUSTRIES.map(({ key, title, description, detail, tags }) => (
          <div
            key={key}
            id={`panel-${key}`}
            role="tabpanel"
            aria-labelledby={`tab-${key}`}
            className={styles.panel}
            hidden={key !== activeKey}
          >
            <h3 className={styles.panelTitle}>{title}</h3>
            <div>
              <p className={styles.panelBody}>{description}</p>
              {detail && <p className={styles.panelDetail}>{detail}</p>}
              <div className={styles.tags}>
                {tags.map(({ label, escalates }) => (
                  <span key={label} className={escalates ? styles.tagEscalates : styles.tag}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.2} className={styles.cta}>
        <div>
          <h3 className={styles.ctaTitle}>¿Tu industria no está aquí?</h3>
          <p className={styles.ctaBody}>
            No vendemos una plantilla por industria. Analizamos el proceso.
          </p>
        </div>
        <Link
          href={DISCOVERY_ANCHOR}
          className={styles.ctaButton}
          onClick={() => track('cta_click', { label: 'Quiero saber qué puedo automatizar' })}
        >
          Quiero saber qué puedo automatizar
        </Link>
      </Reveal>
    </Section>
  );
}
