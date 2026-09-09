import type { ElementType, ReactNode } from 'react';

import styles from './Reveal.module.css';

export interface RevealProps {
  readonly children: ReactNode;
  /** Retardo en segundos, para escalonar varios elementos de un bloque. */
  readonly delay?: number;
  /** Etiqueta a renderizar. Por defecto `div`. */
  readonly as?: ElementType;
  readonly className?: string;
  readonly id?: string;
}

/**
 * Envoltorio que aparece al entrar en pantalla.
 *
 * Marca al elemento con `data-reveal`; quien lo observa es `useRevealOnScroll`,
 * un único `IntersectionObserver` para toda la página. Así las secciones siguen
 * siendo componentes de servidor y no se instancia un observador por bloque.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className, id }: RevealProps) {
  return (
    <Tag
      id={id}
      data-reveal=""
      className={className ? `${styles.reveal} ${className}` : styles.reveal}
      style={delay ? ({ '--reveal-delay': `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
