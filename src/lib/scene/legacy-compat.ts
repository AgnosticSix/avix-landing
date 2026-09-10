import { ColorManagement, LinearSRGBColorSpace, type WebGLRenderer } from 'three';

/**
 * Capa de compatibilidad con Three.js r149.
 *
 * La escena del isotipo se ajustó a ojo contra los valores por defecto de r149.
 * Entre r149 y la versión actual cambiaron tres cosas que alteran el resultado
 * **sin** producir ningún error, de modo que el sitio compilaría y se vería mal:
 *
 * 1. `ColorManagement.enabled` pasó a `true` en r150. En r149 (`legacyMode`)
 *    los colores hexadecimales se enviaban al shader tal cual, sin convertirse
 *    de sRGB a linear-sRGB.
 * 2. `renderer.outputEncoding` (por defecto `LinearEncoding`) se sustituyó en
 *    r152 por `outputColorSpace`, cuyo valor por defecto es `SRGBColorSpace`.
 *    Aplicar la curva sRGB a una paleta ya ajustada lava los azules del fondo.
 * 3. `useLegacyLights` pasó a `false` en r155 y desapareció en r165. El modo
 *    heredado multiplicaba internamente las intensidades por π; sin él, toda la
 *    iluminación queda ~3,14 veces más oscura.
 *
 * Mantener el aspecto original es intencionado: la alternativa era reajustar
 * toda la paleta a ojo, lo que no es reproducible. Si en el futuro se quiere
 * migrar al pipeline de color moderno, hay que rehacer el ajuste cromático
 * completo y comparar contra `reference/original-site.html`.
 *
 * @see https://github.com/mrdoob/three.js/wiki/Migration-Guide
 */
export function applyLegacyColorPipeline(renderer: WebGLRenderer): void {
  ColorManagement.enabled = false;
  renderer.outputColorSpace = LinearSRGBColorSpace;
}

/**
 * Factor que restituye las intensidades de luz del modo heredado (r149).
 *
 * Aplícalo a toda intensidad tomada del diseño original. Compensa el π que
 * `useLegacyLights` añadía internamente y que el pipeline actual ya no aplica.
 */
export const LEGACY_LIGHT_SCALE = Math.PI;

/**
 * Caída de la luz puntual.
 *
 * r149 en modo heredado usaba `(1 - d / distance)^decay`; el shader actual usa
 * la caída física `1 / d^decay`. No hay equivalencia exacta entre ambas, así que
 * `decay = 0` es una aproximación deliberada: desactiva la atenuación por
 * distancia del shader y deja la luz acotada sólo por `distance`. Para una luz
 * de acento cuyo radio (16 u) ya cubre todo el isotipo, es lo más cercano al
 * original.
 *
 * El conjunto de la escena se comparó contra `reference/original-site.html` y
 * la paleta coincide, pero estos dos valores son un ajuste razonado, no una
 * medición. Si algún día se afina la iluminación, empieza por aquí y repite la
 * comparación descrita en AGENTS.md → «Comprobación de paridad visual».
 */
export const POINT_LIGHT_FALLOFF = {
  distance: 16,
  decay: 0,
} as const;
