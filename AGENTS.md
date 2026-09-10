<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AVIX — landing

Página única (one-page) de AVIX, en español. Next.js 16 con App Router, React 19,
TypeScript y CSS Modules. Sin base de datos y sin backend: se despliega como
sitio estático.

## Comandos

```bash
pnpm install      # pnpm es obligatorio; hay lockfile y campo packageManager
pnpm dev          # servidor de desarrollo en http://localhost:3000
pnpm build        # build de producción (prerenderiza todas las rutas)
pnpm check        # typecheck + lint + formato — ejecútalo antes de cada commit
```

## Arquitectura

```
src/
├── app/            Rutas, metadatos, tipografías y estilos globales
├── components/
│   ├── layout/     Barra superior y pie
│   ├── scene/      Fondo: capas decorativas, canvas 3D, pantalla de carga
│   ├── sections/   Una carpeta plana, un componente por sección de la página
│   └── ui/         Primitivas reutilizables (Section, Reveal, AvixLogo)
├── config/         Configuración del sitio y banderas de funcionalidad
├── content/        Todos los textos y datos de la página
├── hooks/          Comportamiento de cliente reutilizable
└── lib/
    ├── scene/      Escena Three.js del isotipo
    ├── analytics.ts
    └── element-ids.ts
```

### Reglas que conviene respetar

**El contenido no vive en los componentes.** Todos los textos están en
`src/content/`. Un cambio de copy no debería tocar ni una etiqueta JSX. Las
excepciones son los títulos de sección y los simulacros de interfaz de
`PainPoints`, que son inseparables del diseño.

**Por defecto, componente de servidor.** Sólo llevan `'use client'` los que
necesitan estado o APIs del navegador: `SceneController`, `Loader`,
`BeforeAfter`, `Industries`, `Discovery` y `ScrambleHeadline`. Las demás
secciones son HTML estático, que es lo que quiere una landing con intención SEO.

**Los metadatos van en el `export const metadata`** de `app/layout.tsx`, nunca
en etiquetas sueltas dentro de los componentes. La imagen de vista previa la
genera `app/opengraph-image.tsx` con `next/og`; un solo archivo cubre Open Graph
y Twitter, porque la tarjeta de Twitter recurre a la de Open Graph. La dibuja
Satori, no un navegador: no entiende variables CSS ni `currentColor` y exige
`display: flex` explícito, así que ese archivo repite los colores en literales
a propósito.

**La página 404 es `app/not-found.tsx`**, componente de servidor y sin escena
3D. Va marcada `robots: { index: false }`: una 404 indexada compite en los
resultados con las páginas que sí importan.

**Los estilos van en CSS Modules**, con los colores y medidas tomados de los
tokens de `app/globals.css`. No se añaden colores nuevos en línea.

## La excepción imperativa

`src/hooks/useScrollScene.ts` escribe estilos directamente sobre el DOM a
60 fps: opacidad y desenfoque del canvas, fondo de la barra, posición del pulso
de la retícula y resplandor del título activo.

Es deliberado y no debe «arreglarse» pasándolo a estado de React: eso provocaría
un render del árbol completo por fotograma. La frontera está contenida — es el
único punto del proyecto que toca el DOM de forma imperativa, y sólo escribe
propiedades de presentación que ningún componente reclama.

Los elementos se localizan por `id`, definidos en `src/lib/element-ids.ts`. Ese
módulo **no** puede llevar `'use client'`: si lo llevara, Next convertiría la
constante en una referencia de cliente y los componentes de servidor
renderizarían los `id` vacíos, sin ningún error visible.

## Three.js: compatibilidad con r149

La escena se diseñó contra Three.js r149 y se ejecuta sobre una versión actual.
Tres valores por defecto cambiaron entre medias y alteran el resultado **sin
producir errores**, así que `src/lib/scene/legacy-compat.ts` los restituye:
gestión de color desactivada, espacio de color de salida lineal e intensidades
de luz multiplicadas por π.

Antes de tocar la escena, lee ese archivo. Si algún día se migra al pipeline de
color moderno, hay que reajustar toda la paleta y comparar contra el original.

## Dos trampas de hidratación que ya mordieron

Ambas producen código que compila, pasa el lint y se ve casi bien:

1. **Una constante exportada desde un módulo `'use client'`** llega a los
   componentes de servidor como referencia de cliente, no como su valor. Por eso
   `ELEMENT_IDS` vive en un módulo neutro.
2. **`usePrefersReducedMotion` devuelve `false` durante la hidratación**, porque
   ése es el valor del servidor, y sólo se corrige en el render siguiente —
   cuando el efecto que descarga Three.js ya se ha ejecutado. Para decidir _si_
   lanzar una descarga, usa `prefersReducedMotionNow()`, que consulta al
   navegador de forma síncrona.

## Decisiones ya tomadas (no las rehagas sin motivo)

**Sin Content Security Policy, y es deliberado.** Next inyecta dos `<script>`
en línea en el HTML estático (el arranque de hidratación). Una CSP estricta
exige un _nonce_ por petición, y eso obliga a renderizado dinámico con Proxy:
se perdería el prerenderizado completo, que es la principal ventaja de este
sitio. La alternativa —CSP con `'unsafe-inline'`— cumpliría una auditoría
superficial sin aportar protección real. La superficie de ataque es mínima: no
hay entradas de usuario que se rendericen, ni contenido de terceros. Si algún
día hace falta CSP de verdad, el camino es Proxy + nonce, asumiendo el coste.

**Los enlaces de navegación son absolutos (`/#seccion`), no fragmentos.** El pie
también se muestra en la página 404, donde un fragmento suelto no lleva a
ninguna parte. Van con `<Link>` de `next/link`, que ESLint exige para rutas
internas; está verificado que conserva el desplazamiento suave.

**Las métricas de Vercel sólo se montan en la plataforma.** Sus scripts viven en
`/_vercel/*`, ruta que no existe fuera de Vercel: en local llenarían la consola
de 404. La condición es `process.env.VERCEL === '1'`, evaluada en el servidor
durante el prerenderizado.

## Comprobación de paridad visual

`reference/original-site.html` es el prototipo del que nació este proyecto y se
conserva a propósito. Compilar y pasar el typecheck **no** demuestra que un
cambio visual sea correcto; para eso:

```bash
pnpm dev                                     # la versión actual, en :3000
python3 -m http.server 8080 -d reference     # el original, en :8080
```

Abre ambos en paralelo y compara el hero, los límites entre secciones y los
puntos de ruptura de 1100, 1000 y 860 px.

Dos detalles que ya costaron una corrección:

- El prototipo usa **`content-box`** en los contenedores y en algunos elementos
  con `min-height` (los `<button>` no: el navegador ya les aplica `border-box`).
  Por eso los contenedores calculan `max-width: calc(ancho + padding * 2)` y unos
  pocos elementos declaran `box-sizing: content-box` con un comentario. No los
  «simplifiques» sin volver a medir.
- Un `display` puesto en una clase **gana** al `display: none` que el navegador
  aplica a `[hidden]`. Los paneles de pestañas de `Industries` necesitan una
  regla `.panel[hidden] { display: none }` explícita; sin ella se muestran los
  tres a la vez, y comprobar `element.hidden` desde la consola no lo delata.

## Qué se dejó fuera del prototipo

El runtime de artefactos (`dc-runtime`), el componente `image-slot`, el envoltorio
`<x-dc>` y las fuentes empotradas en base64. Las tipografías se sirven ahora con
`next/font` (Inter y Space Grotesk), sin declarar `weight`: ambas son variables,
así que se descargan los mismos archivos con lista de pesos o sin ella. Ver
`src/app/fonts.ts` antes de volver a añadirla.

## Rutas y archivos especiales

Además de la portada, el proyecto define:

- `app/not-found.tsx` — 404 propia. Se usa esta y no `global-not-found.tsx`,
  que sigue siendo experimental y requiere activar `experimental.globalNotFound`.
- `app/global-error.tsx` — última red de seguridad. Sustituye al documento
  entero, así que importa por su cuenta los estilos y las tipografías, y pone el
  título con el componente `<title>` de React (ahí no vale `export metadata`).
  **El prop de recuperación es `retry`**, no `reset` ni `unstable_retry`:
  compruébalo en `node_modules/next/dist/docs` si cambias de versión de Next.
- `app/opengraph-image.tsx` — la tarjeta social se genera en compilación con
  `next/og`, leyendo el texto de `siteConfig`. El motor (Satori) sólo entiende
  un subconjunto de CSS: flexbox sí, grid no, y `display: flex` explícito en
  todo elemento con varios hijos.
- `app/icon.svg` — favicon.

## Pendientes conocidos

- Los retratos del equipo son marcadores con la inicial. Para publicarlos: añade
  la imagen a `public/` y apunta `portrait` en `src/content/team.ts`.
- El formulario de diagnóstico termina en un `mailto:`. Si se conecta un CRM, el
  punto a cambiar es `buildMailtoHref` en `Discovery.tsx`.
- La analítica empuja eventos a `window.dataLayer`; falta instalar el contenedor
  de Google Tag Manager.
