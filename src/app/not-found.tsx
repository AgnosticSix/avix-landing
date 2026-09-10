import Link from 'next/link';
import type { Metadata } from 'next';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { siteConfig } from '@/config/site';

import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: `Página no encontrada | ${siteConfig.name}`,
  description: 'La página que buscas no existe.',
  robots: { index: false, follow: true },
};

/**
 * 404 del sitio.
 *
 * Se usa `not-found.tsx` y no `global-not-found.tsx`: el segundo sigue siendo
 * experimental y exige activar `experimental.globalNotFound`. Para un sitio de
 * una sola página, esta versión hereda el layout —tipografías y estilos
 * globales incluidos— sin ninguna bandera.
 */
export default function NotFound() {
  return (
    <>
      <main className={styles.main}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Esta página no existe.</h1>
        <p className={styles.body}>
          Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.
        </p>
        <Link href="/" className={styles.action}>
          Volver al inicio
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
