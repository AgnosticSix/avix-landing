import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

/**
 * Sitemap del sitio: una sola URL, la portada.
 *
 * Sin `lastModified` a propósito. Era `new Date()`, es decir la hora de
 * compilación: cada despliegue —aunque sólo tocara el CSS— anunciaba contenido
 * nuevo, y un `lastmod` que siempre cambia es un `lastmod` que los buscadores
 * aprenden a ignorar. Es el mismo razonamiento por el que el pie no imprime el
 * año (ver `SiteFooter.tsx`): un valor derivado del reloj del compilador se
 * queda viejo —o miente— él solo.
 *
 * Si algún día conviene declararlo, el valor tiene que venir del contenido: una
 * fecha en `src/content/` que se actualice al cambiar el copy, no del build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
