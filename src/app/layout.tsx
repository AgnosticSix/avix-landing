import type { Metadata, Viewport } from 'next';

import { siteConfig } from '@/config/site';

import { inter, spaceGrotesk } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.openGraph.title,
    description: siteConfig.openGraph.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.openGraph.title,
    description: siteConfig.openGraph.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050b14',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang={siteConfig.locale} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      {/*
        `suppressHydrationWarning` cubre un caso que no depende de este código:
        varias extensiones del navegador (ClickUp, Grammarly, gestores de
        contraseñas…) añaden clases o atributos al `<body>` antes de que React
        hidrate, y eso provoca un aviso de discrepancia que nadie puede corregir
        desde la aplicación.

        Sólo silencia las diferencias de este elemento —sus propios atributos y
        su texto directo—, no las de sus descendientes, así que una discrepancia
        real dentro de la página seguiría apareciendo.
      */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
