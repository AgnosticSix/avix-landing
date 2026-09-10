'use client';

import Link from 'next/link';

import { useRef, useState, type KeyboardEvent } from 'react';

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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectIndustry = (key: string): void => {
    setActiveKey(key);
    track('vertical_view', { vertical: key });
  };

  /**
   * Teclado del patrón de pestañas: flechas para moverse entre ellas —dando la
   * vuelta en los extremos— e `Inicio`/`Fin` para ir a la primera o la última.
   *
   * Los roles ARIA anuncian a un lector de pantalla que el grupo se recorre
   * así; sin esto se anunciaba un comportamiento que el marcado no cumplía. El
   * `tabIndex` móvil que las acompaña hace que el tabulador entre y salga del
   * grupo de una vez, en lugar de detenerse en cada pestaña.
   */
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = INDUSTRIES.length - 1;
    let next: number;

    switch (event.key) {
      case 'ArrowRight':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    const industry = INDUSTRIES[next];
    if (!industry) return;

    event.preventDefault();
    selectIndustry(industry.key);
    tabRefs.current[next]?.focus();
  };

  return (
    <Section id="ejemplos">
      <Eyebrow>Ejemplos</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        ¿Dónde podría funcionar?
      </Reveal>

      <Reveal delay={0.2}>
        <div className={styles.tablist} role="tablist" aria-label="Sectores">
          {INDUSTRIES.map(({ key, label }, index) => (
            <button
              key={key}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={key === activeKey}
              aria-controls={`panel-${key}`}
              tabIndex={key === activeKey ? 0 : -1}
              className={styles.tab}
              onClick={() => selectIndustry(key)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
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
