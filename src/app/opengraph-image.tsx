import { ImageResponse } from 'next/og';

import { siteConfig } from '@/config/site';
import { HERO } from '@/content/hero';
import { PALETTE } from '@/lib/scene/isotype';

/**
 * Imagen que acompaña al sitio cuando se comparte en redes o mensajería.
 *
 * Se genera en tiempo de compilación con `next/og`, así que no hay que
 * mantener un PNG a mano: el texto sale de `@/content/hero` y `siteConfig`, de
 * modo que un cambio de copy se refleja aquí sin tocar este archivo.
 *
 * El motor (Satori) sólo entiende un subconjunto de CSS —flexbox sí, grid no— y
 * exige `display: flex` explícito en cualquier elemento con varios hijos.
 * Tampoco resuelve variables CSS, así que los colores que no están en `PALETTE`
 * se repiten aquí como literales; son los mismos de `globals.css`.
 */

export const alt = siteConfig.openGraph.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const hex = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: hex(PALETTE.background),
        // Satori no aplica degradados de fondo sobre `background` compuesto,
        // así que el halo de marca se pinta como una capa aparte.
        backgroundImage: `radial-gradient(900px 600px at 85% -10%, rgba(0,188,212,0.18), transparent 65%)`,
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', width: 44, height: 44, background: '#0f93a8' }} />
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            letterSpacing: 12,
            color: '#8fa3b5',
          }}
        >
          {siteConfig.name}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 74,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          {`${HERO.headline.lead}${HERO.headline.highlight}`}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#c7d3de', maxWidth: 900 }}>
          {siteConfig.promise}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', width: 60, height: 3, background: hex(PALETTE.cyan) }} />
        <div style={{ display: 'flex', fontSize: 24, color: '#8fa3b5', letterSpacing: 4 }}>
          {HERO.eyebrow.toUpperCase()}
        </div>
      </div>
    </div>,
    size,
  );
}
