'use client';

import { useEffect } from 'react';

import { siteConfig } from '@/config/site';

import { inter, spaceGrotesk } from './fonts';
import './globals.css';
import styles from './global-error.module.css';

/**
 * Última red de seguridad: captura los errores que escapan del layout raíz.
 *
 * Tiene tres particularidades frente a un componente normal, todas impuestas
 * por Next:
 *
 * 1. Sustituye al documento entero, así que debe declarar `<html>` y `<body>`
 *    e importar por su cuenta los estilos globales y las tipografías.
 * 2. No admite `export const metadata`; el título se pone con el componente
 *    `<title>` de React.
 * 3. El prop de recuperación es `retry` —vuelve a pedir y renderizar el
 *    contenido—, no `reset`, que sólo limpia el estado del límite de error.
 *
 * @see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
 */
export default function GlobalError({
  error,
  retry,
}: {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}) {
  useEffect(() => {
    // En producción el mensaje llega saneado; `digest` es lo que permite
    // cruzarlo con la traza del servidor.
    console.error('Error global:', error.digest ?? error.message);
  }, [error]);

  return (
    <html lang={siteConfig.locale} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning>
        <title>{`Algo ha fallado | ${siteConfig.name}`}</title>
        <main className={styles.main}>
          <p className={styles.eyebrow}>Error inesperado</p>
          <h1 className={styles.title}>Algo ha fallado de nuestro lado.</h1>
          <p className={styles.body}>
            Puedes reintentar; si sigue ocurriendo, escríbenos y lo revisamos.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.retry} onClick={() => retry()}>
              Reintentar
            </button>
            <a href={`mailto:${siteConfig.contactEmail}`} className={styles.contact}>
              {siteConfig.contactEmail}
            </a>
          </div>
          {error.digest && <p className={styles.digest}>Referencia: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
