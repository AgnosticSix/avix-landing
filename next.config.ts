import type { NextConfig } from 'next';

/**
 * Cabeceras de seguridad aplicadas a todas las rutas.
 *
 * No se define CSP aquí: la landing es estática y no ejecuta scripts de
 * terceros, pero una CSP correcta depende del proveedor de analítica que se
 * conecte a `dataLayer`. Ver README → «Seguridad» antes de añadirla.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: [...securityHeaders] }],
};

export default nextConfig;
