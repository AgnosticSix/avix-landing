import type { ReactNode } from 'react';

import { Reveal } from './Reveal';
import styles from './Section.module.css';

export interface SectionProps {
  /** Ancla de navegación. Debe coincidir con los enlaces del menú. */
  readonly id: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/** Sección de la página: ancho máximo, relleno vertical y contexto de apilado. */
export function Section({ id, children, className }: SectionProps) {
  return (
    <section id={id} className={className ? `${styles.section} ${className}` : styles.section}>
      <div className={styles.container}>{children}</div>
    </section>
  );
}

/**
 * Antetítulo que abre cada sección.
 *
 * Incluye su propia aparición al hacer scroll porque siempre es el primer
 * elemento del bloque y nunca lleva retardo. El hero usa una variante distinta,
 * con filete, que vive en su propio módulo.
 */
export function Eyebrow({ children }: { readonly children: ReactNode }) {
  return <Reveal className={styles.eyebrow}>{children}</Reveal>;
}
