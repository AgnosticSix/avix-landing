'use client';

import { useEffect } from 'react';

import { siteConfig } from '@/config/site';
import { ELEMENT_IDS } from '@/lib/element-ids';
import { clamp01, lerp, smoothstep } from '@/lib/math';
import type { AvixScene, ScreenPoint } from '@/lib/scene/avix-scene';

/**
 * Bucle de animación ligado al scroll.
 *
 * **Excepción imperativa deliberada.** Este hook escribe estilos directamente
 * sobre el DOM a 60 fps. Llevar estos valores por estado de React provocaría un
 * render por fotograma sobre todo el árbol de la página, que es exactamente lo
 * que el diseño no puede permitirse. La frontera está aquí: es el único punto
 * del proyecto que manipula el DOM de forma imperativa, y sólo toca propiedades
 * de presentación (opacidad, transformación, sombra) que ningún componente de
 * React reclama. Ver AGENTS.md → «La excepción imperativa».
 *
 * Todos los elementos se localizan por `id`. Las secciones son componentes de
 * servidor y no admiten `ref`, y mezclar ambos mecanismos haría el contrato más
 * difícil de seguir que uniformarlo. Los ids ya son parte del contrato público
 * de la página —los enlaces del menú apuntan a ellos—, así que no son frágiles.
 * Los ids que consume este hook están centralizados en `ELEMENT_IDS`.
 */

/** Secciones en orden de aparición. Define el recorrido de la cámara. */
const SECTION_IDS = [
  'inicio',
  'te-suena',
  'antes-despues',
  'que-hace',
  'agentes',
  'ejemplos',
  'como-empezamos',
  'equipo',
  'cuando',
  'faq',
  'descubrir',
] as const;

/** Desplazamiento a partir del cual la barra superior se vuelve sólida. */
const NAV_SOLID_AFTER_PX = 40;
/** El CTA de la barra aparece cuando el del hero queda por encima de esta línea. */
const HERO_CTA_HIDDEN_ABOVE_PX = 72;

/** Opacidad del canvas 3D: máxima en el hero, tenue en el cuerpo, media al cierre. */
const CANVAS_OPACITY = { hero: 1, body: 0.5, closing: 0.65 } as const;
/** Desenfoque del canvas, en píxeles, con el mismo criterio. */
const CANVAS_BLUR = { hero: 0, body: 1.2, closing: 1.6 } as const;
/** En móvil el fondo se atenúa: compite con el texto en pantallas pequeñas. */
const MOBILE_CANVAS_DAMPING = 0.75;
const MOBILE_QUERY = '(max-width: 860px)';

/** Duración de una vuelta completa del pulso por la retícula neuronal. */
const NEURAL_PULSE_PERIOD_MS = 14_000;
/** Radio, en unidades del `viewBox`, dentro del cual el pulso enciende un nodo. */
const NEURAL_PULSE_RADIUS = 140;

export interface ScrollSceneOptions {
  /**
   * Fábrica de la escena 3D, o `null` mientras Three.js aún se está cargando.
   * Se invoca una sola vez, en el primer fotograma tras estar disponible; hasta
   * entonces el bucle ya anima la barra, el canvas y la retícula. Devuelve
   * `null` si el navegador no ofrece WebGL.
   */
  readonly createScene: ((canvas: HTMLCanvasElement) => AvixScene | null) | null;
  /** Desactiva cámara, luz viajera y resplandor de títulos. */
  readonly reducedMotion: boolean;
}

/** Curva de opacidad/desenfoque por sección. */
function rampFor(
  index: number,
  total: number,
  ramp: { hero: number; body: number; closing: number },
) {
  if (index === 0) return ramp.hero;
  if (index === total - 1) return ramp.closing;
  return ramp.body;
}

export function useScrollScene({ createScene, reducedMotion }: ScrollSceneOptions): void {
  useEffect(() => {
    const byId = <T extends Element>(id: string): T | null =>
      document.getElementById(id) as T | null;

    const nav = byId<HTMLElement>(ELEMENT_IDS.nav);
    const navCta = byId<HTMLAnchorElement>(ELEMENT_IDS.navCta);
    const heroCta = byId<HTMLAnchorElement>(ELEMENT_IDS.heroCta);
    const canvas = byId<HTMLCanvasElement>(ELEMENT_IDS.canvas);
    const neural = byId<SVGSVGElement>(ELEMENT_IDS.neural);
    const neuralRoute = byId<SVGPathElement>(ELEMENT_IDS.neuralRoute);
    const neuralPulse = byId<SVGCircleElement>(ELEMENT_IDS.neuralPulse);
    const neuralPulseGlow = byId<SVGCircleElement>(ELEMENT_IDS.neuralPulseGlow);

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const headings = sections.map((section) => section.querySelector<HTMLElement>('h1, h2'));
    const opacityRamp = sections.map((_, index) => rampFor(index, sections.length, CANVAS_OPACITY));
    const blurRamp = sections.map((_, index) => rampFor(index, sections.length, CANVAS_BLUR));

    const mobile = window.matchMedia(MOBILE_QUERY);
    const { sectionMotion, nodeLight } = siteConfig.featureFlags;
    const cameraMotion = sectionMotion && !reducedMotion;
    const lightEnabled = nodeLight && !reducedMotion;

    const routeLength = neuralRoute?.getTotalLength() ?? 0;
    const neuralNodes = neural
      ? [...neural.querySelectorAll<SVGCircleElement>('g[fill] circle')].map((circle) => ({
          x: Number(circle.getAttribute('cx')),
          y: Number(circle.getAttribute('cy')),
          element: circle,
        }))
      : [];

    let scene: AvixScene | null = null;
    // Un solo intento: si no hay WebGL, no se reintenta en cada fotograma.
    let sceneAttempted = false;

    // Con movimiento reducido no habrá escena: el canvas se retira de la
    // composición en lugar de quedarse vacío animando su opacidad.
    if (canvas && !cameraMotion && !lightEnabled) canvas.style.display = 'none';
    let running = true;
    let disposed = false;
    let frameId: number | null = null;
    let navCtaVisible = false;
    let litHeading: HTMLElement | null = null;

    const clearHeadingGlow = (): void => {
      if (!litHeading) return;
      litHeading.style.textShadow = 'none';
      litHeading.style.filter = 'none';
      litHeading = null;
    };

    const paintNav = (scrollY: number): void => {
      if (!nav) return;
      const solid = scrollY > NAV_SOLID_AFTER_PX;
      nav.style.background = solid ? 'rgba(5,11,20,.82)' : 'transparent';
      nav.style.borderBottomColor = solid ? 'rgba(255,255,255,.07)' : 'transparent';
      nav.style.backdropFilter = solid ? 'blur(12px)' : 'none';
    };

    /** El CTA de la barra sustituye al del hero en cuanto éste sale de pantalla. */
    const paintNavCta = (): void => {
      if (!navCta) return;

      const heroCtaRect = heroCta?.getBoundingClientRect();
      const shouldShow = !heroCtaRect || heroCtaRect.bottom < HERO_CTA_HIDDEN_ABOVE_PX;
      if (shouldShow === navCtaVisible) return;

      navCtaVisible = shouldShow;
      navCta.style.opacity = shouldShow ? '1' : '0';
      navCta.style.transform = shouldShow ? 'none' : 'translateY(-6px)';
      navCta.style.pointerEvents = shouldShow ? 'auto' : 'none';
      navCta.style.maxWidth = shouldShow ? '320px' : '0';
      navCta.style.paddingLeft = shouldShow ? '20px' : '0';
      navCta.style.paddingRight = shouldShow ? '20px' : '0';
      navCta.style.marginLeft = shouldShow ? '0' : '-28px';
    };

    /** Sección visible y avance dentro de ella, como un único número continuo. */
    const readScrollPosition = (): number => {
      const viewportMiddle = window.innerHeight * 0.5;
      let index = 0;
      let within = 0;

      for (const [position, section] of sections.entries()) {
        const rect = section.getBoundingClientRect();
        if (rect.top > viewportMiddle) continue;
        index = position;
        within = clamp01((viewportMiddle - rect.top) / Math.max(1, rect.height));
      }

      return index + within;
    };

    const paintCanvas = (position: number): void => {
      if (!canvas || !lightEnabled) return;

      const lower = Math.min(sections.length - 1, Math.floor(position));
      const upper = Math.min(sections.length - 1, lower + 1);
      const t = smoothstep(clamp01(position - lower));

      const opacity =
        lerp(opacityRamp[lower] ?? 1, opacityRamp[upper] ?? 1, t) *
        (mobile.matches ? MOBILE_CANVAS_DAMPING : 1);
      const blur = lerp(blurRamp[lower] ?? 0, blurRamp[upper] ?? 0, t);

      canvas.style.opacity = opacity.toFixed(3);
      canvas.style.filter = `blur(${blur.toFixed(2)}px)`;
    };

    /** Desplaza la retícula y mueve el pulso por su ruta cerrada. */
    const paintNeural = (sceneProgress: number, now: number): void => {
      if (neural) {
        const shift = 2 - (sceneProgress / 5) * 6;
        neural.style.transform = `translateX(${shift.toFixed(2)}vw) scale(.92)`;
      }

      if (!neuralRoute || !neuralPulse || !neuralPulseGlow || routeLength === 0) return;

      const along = routeLength * ((now % NEURAL_PULSE_PERIOD_MS) / NEURAL_PULSE_PERIOD_MS);
      const point = neuralRoute.getPointAtLength(along);

      for (const target of [neuralPulse, neuralPulseGlow]) {
        target.setAttribute('cx', String(point.x));
        target.setAttribute('cy', String(point.y));
      }

      // Los nodos cercanos al pulso crecen y viran del cian al cobre.
      for (const node of neuralNodes) {
        const distance = Math.hypot(node.x - point.x, node.y - point.y);
        const proximity = clamp01(1 - distance / NEURAL_PULSE_RADIUS);
        node.element.setAttribute('r', (2.5 + proximity * 3.5).toFixed(1));
        node.element.style.fill =
          proximity > 0
            ? `rgba(${(proximity * 205) | 0}, ${(188 - proximity * 61) | 0}, ${(212 - proximity * 162) | 0}, ${(0.32 + proximity * 0.6).toFixed(2)})`
            : '';
      }
    };

    /** Resplandor sobre el título de la sección activa, según lo cerca que pase la luz. */
    const paintHeadingGlow = (index: number, lightPoint: ScreenPoint | null): void => {
      const heading = headings[index];
      if (!heading || !lightPoint || !lightEnabled) {
        clearHeadingGlow();
        return;
      }

      if (litHeading && litHeading !== heading) clearHeadingGlow();
      litHeading = heading;

      const rect = heading.getBoundingClientRect();
      const dx = lightPoint.x - (rect.left + rect.width / 2);
      const dy = lightPoint.y - (rect.top + rect.height / 2);
      const reach = Math.max(window.innerWidth, 900) * 0.6;
      const proximity = clamp01(1 - Math.hypot(dx, dy) / reach);

      heading.style.textShadow =
        `0 0 ${(14 + proximity * 40).toFixed(0)}px rgba(0,188,212,${(proximity * 0.9).toFixed(3)}), ` +
        `0 0 ${(proximity * 90).toFixed(0)}px rgba(0,188,212,${(proximity * 0.35).toFixed(3)})`;
      heading.style.filter = `brightness(${(1 + proximity * 0.25).toFixed(3)})`;
    };

    const frame = (now: number): void => {
      if (!running) return;

      paintNav(window.scrollY);
      paintNavCta();

      const position = readScrollPosition();
      const index = Math.min(sections.length - 1, Math.floor(position));
      paintCanvas(position);

      // La escena 3D se crea en el primer fotograma, no al montar: así el coste
      // de compilar shaders no compite con la primera pintura de la página.
      if (!sceneAttempted && canvas && createScene) {
        sceneAttempted = true;
        scene = createScene(canvas);
        // Sin WebGL el canvas queda vacío: se oculta para que no tape nada.
        if (!scene) canvas.style.display = 'none';
      }

      // El recorrido de la cámara abarca seis tramos repartidos por la página.
      const sceneProgress = (position / Math.max(1, sections.length - 1)) * 5;
      paintNeural(sceneProgress, now);

      const lightPoint =
        scene?.update({
          cameraProgress: sceneProgress,
          segmentIndex: Math.min(5, Math.floor(sceneProgress + 0.0001)),
          now,
          cameraMotion,
          travellingLight: lightEnabled,
        }) ?? null;

      paintHeadingGlow(index, lightPoint);
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    // En una pestaña oculta no hay nada que dibujar y el bucle gastaría batería.
    const onVisibilityChange = (): void => {
      if (document.hidden) {
        running = false;
        return;
      }
      if (!running && !disposed) {
        running = true;
        frameId = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      running = false;
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearHeadingGlow();
      scene?.dispose();
    };
  }, [createScene, reducedMotion]);
}
