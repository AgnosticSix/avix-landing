import Link from 'next/link';

import { AvixLogo } from '@/components/ui/AvixLogo';
import { siteConfig } from '@/config/site';
import { DISCOVERY_ANCHOR, PRIMARY_NAV } from '@/content/navigation';
import { ELEMENT_IDS } from '@/lib/element-ids';

import styles from './TopNav.module.css';

export function TopNav() {
  return (
    <nav id={ELEMENT_IDS.nav} className={styles.nav} aria-label="Principal">
      <div className={styles.inner}>
        <Link href="/#inicio" className={styles.brand} aria-label="AVIX — inicio">
          <AvixLogo height={22} />
          <span className={styles.brandTag}>IA aplicada a empresas serias</span>
        </Link>

        <div className={styles.links}>
          {PRIMARY_NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link}>
              {label}
            </Link>
          ))}
          <Link id={ELEMENT_IDS.navCta} href={DISCOVERY_ANCHOR} className={styles.cta}>
            {siteConfig.ctaLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}
