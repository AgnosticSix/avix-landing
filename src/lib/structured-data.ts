/**
 * Datos estructurados de la portada (JSON-LD).
 *
 * Todo el texto se deriva de `siteConfig` y `FAQ_ENTRIES`: aquí no se escribe
 * ni una frase nueva. Es la misma regla que obligó a partir `TAGLINE_PARTS` —
 * cuando una descripción vive en dos sitios acaban divergiendo, y un marcado
 * que contradice a la etiqueta `<meta>` es peor que no tener marcado.
 *
 * La forma —un `<script type="application/ld+json">` nativo dentro del
 * componente de página, no `next/script`, que está pensado para código
 * ejecutable— la fija la guía oficial de Next en
 * `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`.
 */

import { siteConfig } from '@/config/site';
import { FAQ_ENTRIES } from '@/content/faq';

/**
 * Identificadores de los nodos del grafo.
 *
 * El fragmento se pega a `siteConfig.url` sin barra intermedia, de modo que la
 * parte del documento queda escrita igual que la etiqueta canónica que emite
 * `app/layout.tsx` (`https://www.avixsoluciones.com`, sin barra final).
 *
 * Es coherencia del código fuente, no una exigencia del formato: el validador
 * de schema.org normaliza las dos formas a `https://www.avixsoluciones.com/`,
 * así que `/#organization` habría identificado exactamente el mismo recurso.
 * Se deja así para que nadie tenga que preguntarse si la barra significa algo.
 *
 * `webPage` usa `#webpage` y no `#faq`, que ya es un ancla real de la página
 * (`<Section id="faq">`). No habría colisión de verdad —un `@id` es un
 * identificador, no un destino de navegación—, pero leerlo confunde.
 *
 * Renombrar cualquiera de estos identificadores una vez publicado dejaría
 * huérfano al anterior: quien lo hubiera leído seguiría apuntando a un recurso
 * que ya no se emite. Hoy sale gratis porque nada de esto se ha desplegado.
 */
const NODE_IDS = {
  organization: `${siteConfig.url}#organization`,
  website: `${siteConfig.url}#website`,
  webPage: `${siteConfig.url}#webpage`,
} as const;

/**
 * La entidad AVIX.
 *
 * Se declara `Organization` y no `ProfessionalService`: el segundo hereda de
 * `LocalBusiness`, que espera una dirección postal verificable. AVIX no la
 * publica, y un marcado que afirma más de lo que se puede comprobar es un
 * pasivo, no una ventaja.
 *
 * El logotipo apunta al SVG del favicon, que es lo que semánticamente es un
 * logotipo. No se sustituye por `/opengraph-image`: esa es una tarjeta social,
 * no una marca. Ambas URL están comprobadas y responden 200.
 */
const organization = {
  '@type': 'Organization',
  '@id': NODE_IDS.organization,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  slogan: siteConfig.promise,
  email: siteConfig.contactEmail,
  logo: `${siteConfig.url}/icon.svg`,
  image: `${siteConfig.url}/opengraph-image`,
};

/**
 * El sitio.
 *
 * Sin `potentialAction`/`SearchAction`: no hay buscador interno, y declarar uno
 * que no existe es un error frecuente que sólo sirve para que el buscador
 * intente una URL que devuelve 404.
 */
const website = {
  '@type': 'WebSite',
  '@id': NODE_IDS.website,
  url: siteConfig.url,
  name: siteConfig.name,
  description: siteConfig.description,
  inLanguage: siteConfig.locale,
  publisher: { '@id': NODE_IDS.organization },
};

/**
 * La portada, con las preguntas frecuentes que renderiza `Faq.tsx`.
 *
 * Se declara con dos tipos y no sólo con `FAQPage`. `FAQPage` ya es subtipo de
 * `WebPage`, así que la lista no habilita ninguna propiedad nueva; lo que
 * corrige es una afirmación. Con `FAQPage` a secas el marcado decía que este
 * documento es un cuestionario, y es una landing que contiene una sección de
 * preguntas.
 *
 * `about` es la arista que faltaba. El grafo ya decía quién publica el sitio
 * —`publisher`—, que es una relación distinta: nada afirmaba que este documento
 * trate sobre AVIX, que es justo lo que sigue quien intenta pasar del documento
 * a la entidad.
 *
 * Sin `primaryImageOfPage` a propósito, aunque sea la propiedad que suele
 * acompañar a éstas: significa «la imagen principal de la página», y esta
 * página no tiene ninguna. La tarjeta de `/opengraph-image` se dibuja para las
 * vistas previas sociales y no aparece en el documento; declararla aquí
 * afirmaría algo que nadie encontraría al mirar la página.
 *
 * Aviso para quien venga después: esto **no** va a pintar desplegables en los
 * resultados de Google. Desde 2023 el resultado enriquecido de FAQ está
 * restringido a sitios gubernamentales y sanitarios. El marcado se mantiene
 * porque describe el contenido para todo lo demás que lee la página —y porque
 * un marcado no elegible se ignora, no penaliza—, no por el fragmento.
 */
const webPage = {
  '@type': ['WebPage', 'FAQPage'],
  '@id': NODE_IDS.webPage,
  url: siteConfig.url,
  name: siteConfig.title,
  description: siteConfig.description,
  inLanguage: siteConfig.locale,
  isPartOf: { '@id': NODE_IDS.website },
  about: { '@id': NODE_IDS.organization },
  mainEntity: FAQ_ENTRIES.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
};

/** El grafo completo que se incrusta en la portada. */
export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [organization, website, webPage],
};

/**
 * Serializa el grafo para incrustarlo en el HTML.
 *
 * El escapado de `<` a `\u003c` lo pide la guía de Next: `JSON.stringify` no
 * neutraliza una cadena que contenga `</script>`, y con eso bastaría para
 * cerrar la etiqueta antes de tiempo. Hoy ningún texto lleva `<`, pero el
 * marcado se alimenta de `src/content/`, que sí cambia.
 */
export function serializeStructuredData(): string {
  return JSON.stringify(STRUCTURED_DATA).replace(/</g, '\\u003c');
}
