# AVIX — landing

Página única de [AVIX](https://www.avixsoluciones.com): automatización de
procesos empresariales con IA.

Construida con Next.js 16 (App Router), React 19, TypeScript y CSS Modules.
No tiene backend ni base de datos: se prerenderiza por completo y se sirve como
sitio estático, con un fondo tridimensional en Three.js ligado al scroll.

## Requisitos

- Node.js ≥ 22
- pnpm 11 (`corepack enable` lo activa a partir del campo `packageManager`)

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

La página queda en <http://localhost:3000>.

## Comandos

| Comando          | Qué hace                                                |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo con recarga en caliente          |
| `pnpm build`     | Build de producción; prerenderiza todas las rutas       |
| `pnpm start`     | Sirve el build de producción                            |
| `pnpm typecheck` | Comprobación de tipos sin emitir                        |
| `pnpm lint`      | ESLint                                                  |
| `pnpm format`    | Formatea con Prettier                                   |
| `pnpm check`     | Typecheck + lint + formato. Pásalo antes de cada commit |

## Estructura

```
src/
├── app/            Rutas, metadatos, tipografías y estilos globales
│                   (404, error global, imagen Open Graph, favicon)
├── components/
│   ├── layout/     Barra superior y pie
│   ├── scene/      Capas de fondo, canvas 3D y pantalla de carga
│   ├── sections/   Un componente por sección de la página
│   └── ui/         Primitivas reutilizables
├── config/         Configuración del sitio y banderas de funcionalidad
├── content/        Todos los textos y datos
├── hooks/          Comportamiento de cliente reutilizable
└── lib/
    ├── scene/      Escena Three.js del isotipo
    ├── analytics.ts, element-ids.ts, math.ts
reference/          Prototipo original, sólo para consulta
```

### Decisiones de diseño

**El contenido está separado de la presentación.** Todos los textos viven en
`src/content/`, tipados. Cambiar el copy no obliga a tocar un componente.

**Servidor por defecto, cliente por excepción.** Sólo seis componentes llevan
`'use client'`, los que necesitan estado o APIs del navegador. El resto de la
página es HTML estático: es una landing con intención SEO, y su contenido debe
estar en el marcado inicial.

**Three.js se carga aparte.** La biblioteca pesa unos 550 KB y se importa de
forma diferida, después de la primera pintura, en su propio fragmento. Nunca
entra en el bundle inicial, y no se carga en absoluto si el usuario ha pedido
reducir el movimiento. Si el navegador no ofrece WebGL, el canvas se oculta y la
página sigue funcionando.

**El bucle de animación es imperativo a propósito.** `useScrollScene` escribe
estilos sobre el DOM a 60 fps en lugar de pasar por el estado de React, que
provocaría un render completo por fotograma. Es el único punto del proyecto que
lo hace, está aislado en un hook y sólo toca propiedades de presentación.

### Compatibilidad con Three.js r149

La escena se ajustó visualmente contra Three.js r149. Entre esa versión y la
actual cambiaron tres valores por defecto —gestión de color, espacio de color de
salida e intensidad de las luces— que alteran el resultado **sin producir ningún
error**. `src/lib/scene/legacy-compat.ts` los restituye y documenta el porqué.
Conviene leerlo antes de tocar la escena o de subir la versión de Three.js.

## Configuración

`src/config/site.ts` reúne los metadatos, el correo de contacto y tres banderas
heredadas del prototipo:

| Bandera         | Efecto                                              |
| --------------- | --------------------------------------------------- |
| `showLoader`    | Pantalla de carga con contador                      |
| `sectionMotion` | Movimiento de cámara del fondo 3D                   |
| `nodeLight`     | Luz viajera del isotipo y resplandor de los títulos |

`ctaLabel` está tipado como unión de literales para permitir pruebas A/B del
texto del botón principal sin tocar los componentes.

## Accesibilidad

- Se respeta `prefers-reduced-motion`: sin pantalla de carga, sin fondo 3D, sin
  descifrado de texto y sin animaciones CSS.
- Las preguntas frecuentes usan `<details>` nativo: funcionan sin JavaScript.
- El efecto de descifrado del titular mantiene el texto real en el DOM y pinta
  los glifos aleatorios en una capa superpuesta con `aria-hidden`.
- Foco visible en toda la página y objetivos táctiles de 44 px como mínimo.

## Analítica

`src/lib/analytics.ts` es el único punto de contacto con `window.dataLayer`
(Google Tag Manager). Eventos que se registran: `view_home`, `quiz_start`,
`quiz_step`, `quiz_complete`, `vertical_view`, `cta_click` y `book_click`.

El contenedor de GTM todavía no está instalado; los eventos se encolan en
`dataLayer` a la espera.

Aparte de eso, el sitio monta `@vercel/analytics` y `@vercel/speed-insights`,
que aportan los Core Web Vitals de usuarios reales — la única forma de saber si
el fondo tridimensional penaliza a alguien de verdad. Sólo se cargan en los
despliegues de Vercel (`process.env.VERCEL === '1'`): sus scripts se sirven
desde `/_vercel/*`, una ruta que en local devolvería 404.

## Despliegue

El proyecto prerenderiza todas sus rutas, así que funciona en cualquier hosting
estático. En Vercel no necesita configuración: `pnpm build` y listo.

### El pipeline

`.github/workflows/deploy.yml` comprueba y despliega en cada push: `develop` va
a una URL de preview y `main` a producción. Los pull requests sólo se comprueban.
El despliegue está detrás de `pnpm check`, que es la razón de usar GitHub Actions
en lugar de la integración de Vercel para GitHub: allí un fallo de formato o de
lint se publicaría igual, porque Vercel sólo ejecuta `next build`.

Vercel no recibe ningún permiso sobre el repositorio; el enlace es un token en
los secrets de GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`.

**El build lo hace Vercel, no el runner**, y por eso el despliegue no usa
`--prebuilt` pese a ser lo que recomienda la documentación de Vercel para CI.
Las métricas de la sección anterior se montan sólo si `process.env.VERCEL === '1'`
durante el prerenderizado; en un build propio esa variable depende de que
`vercel pull` haya traído las variables de sistema, y si no lo hace el sitio se
publica sin métricas y sin ningún error.

Conviene saber que **esa regresión no se puede detectar con `curl`**: los
componentes de `@vercel/analytics` inyectan su `<script>` tras la hidratación,
así que `_vercel/insights` no aparece en el HTML servido ni siquiera cuando todo
funciona. Comprobarlo exige un navegador —la petición a
`/_vercel/insights/script.js` en la pestaña de red— o el panel de Analytics de
Vercel. El workflow sólo verifica que producción responda 200; un paso con
navegador headless sería la forma de automatizarlo.

### Despliegue manual

`scripts/deploy-vercel.mjs` publica por la API REST, sin CLI ni integración de
Git. Sirve para crear el proyecto la primera vez —el workflow necesita que ya
exista— y para publicar si Actions no está disponible:

```bash
VERCEL_TOKEN=xxx node scripts/deploy-vercel.mjs   # --preview para una preview
```

Las cabeceras de seguridad se definen en `next.config.ts`:
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` y
`Permissions-Policy`.

**No incluye `Content-Security-Policy`, y es una decisión medida.** Next inyecta
dos `<script>` en línea en el HTML estático para arrancar la hidratación. Una
CSP estricta exigiría un _nonce_ por petición, lo que obliga a renderizado
dinámico y hace perder el prerenderizado completo; una CSP con `'unsafe-inline'`
pasaría una auditoría superficial sin proteger de nada. Como la página no
renderiza entradas de usuario ni contenido de terceros, la superficie de ataque
es mínima. Si en el futuro se necesita, el camino es Proxy + nonce.

## Pendientes

- Fotografías del equipo: hoy son marcadores con la inicial. Añade la imagen a
  `public/` y apunta `portrait` en `src/content/team.ts`.
- El formulario de diagnóstico termina en un `mailto:`. Para enviarlo a un CRM,
  el punto a cambiar es `buildMailtoHref` en `Discovery.tsx`.
- Instalar el contenedor de Google Tag Manager.

## Origen del proyecto

Este repositorio partía de un único archivo HTML de 842 KB: un prototipo
autocontenido que empaquetaba, en base64 y comprimido, su propio runtime, Three.js,
React y diez subconjuntos de fuentes. Se conserva en
`reference/original-site.html` como referencia visual.

`AGENTS.md` explica cómo comparar la versión actual contra ese original, que es
la única forma fiable de validar un cambio de diseño.
