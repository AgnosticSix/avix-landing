import Link from 'next/link';

import { AvixLogo } from '@/components/ui/AvixLogo';
import { siteConfig } from '@/config/site';
import { DISCOVERY_ANCHOR, FOOTER_NAV } from '@/content/navigation';

import styles from './SiteFooter.module.css';

const LOCATION = 'CDMX, México';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <AvixLogo height={22} />
            <p className={styles.tagline}>{siteConfig.promise}</p>
            <p className={styles.subTagline}>Automatiza lo repetitivo. Conserva el control.</p>
          </div>

          <div>
            <div className={styles.columnTitle}>Recorrido</div>
            <div className={styles.column}>
              {FOOTER_NAV.map(({ href, label }) => (
                <Link key={href} href={href} className={styles.link}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.columnTitle}>Contacto</div>
            <div className={styles.column}>
              <Link href={DISCOVERY_ANCHOR} className={styles.linkAccent}>
                {siteConfig.ctaLabel}
              </Link>
              <a href={`mailto:${siteConfig.contactEmail}`} className={styles.link}>
                {siteConfig.contactEmail}
              </a>
              <span className={styles.meta}>{LOCATION}</span>
            </div>
          </div>
        </div>

        <div className={styles.legal}>
          {/*
            Sin año a propósito. Esto es un componente de servidor y la página se
            prerenderiza, así que `new Date().getFullYear()` se congelaba en el
            momento del build: en enero el pie seguiría anunciando el año pasado
            hasta que alguien volviera a desplegar. El aviso no pierde validez
            por omitir el año, y así no hay nada que se quede viejo solo.
          */}
          <span>
            © {siteConfig.name} · {LOCATION}
          </span>
          <span>IA aplicada a empresas reales</span>
        </div>
      </div>
    </footer>
  );
}
