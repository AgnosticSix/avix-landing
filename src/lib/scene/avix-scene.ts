import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  EdgesGeometry,
  FogExp2,
  LineBasicMaterial,
  LineCurve3,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';

import {
  EDGES,
  LAST_SCROLL_SEGMENT,
  NODE_COLORS,
  NODE_IDS,
  NODE_POSITIONS,
  NODE_SIZES,
  PALETTE,
  SATELLITES,
  type NodeId,
} from './isotype';
import { LEGACY_LIGHT_SCALE, POINT_LIGHT_FALLOFF, applyLegacyColorPipeline } from './legacy-compat';
import { clamp01, lerp } from '@/lib/math';

import { createPerformanceGovernor, resolvePixelRatioCap } from './performance-governor';
import { createLightTraversal } from './light-traversal';
import { createGlowTexture, createMatrixTexture, type MatrixTexture } from './textures';

/** Punto en píxeles de la ventana. */
export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

export interface SceneUpdateOptions {
  /** Progreso continuo de scroll normalizado al recorrido de la cámara (0–5). */
  readonly cameraProgress: number;
  /** Índice de tramo del isotipo que debe iluminarse (0–5). */
  readonly segmentIndex: number;
  /** Marca de tiempo de `requestAnimationFrame`. */
  readonly now: number;
  /** Si es `false`, la cámara queda fija. */
  readonly cameraMotion: boolean;
  /** Si es `false`, la luz viajera se oculta. */
  readonly travellingLight: boolean;
}

export interface AvixScene {
  /**
   * Dibuja un fotograma.
   * @returns La posición en pantalla de la luz viajera, o `null` si está oculta.
   */
  update(options: SceneUpdateOptions): ScreenPoint | null;
  /** Libera GPU, texturas y listeners. Obligatorio al desmontar. */
  dispose(): void;
}

/**
 * Crea el renderizador, o `null` si el navegador no da un contexto WebGL.
 *
 * Ocurre en equipos sin aceleración, con la GPU en lista negra o con WebGL
 * desactivado. La escena es decorativa, así que no vale la pena propagar el
 * error: el resto de la página funciona igual sin fondo tridimensional.
 */
function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    return new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
}

/** Grosores y opacidades de los tubos apilados que difuminan cada brazo. */
const SOFT_TUBE_LAYERS: readonly (readonly [radius: number, opacity: number])[] = [
  [0.07, 0.42],
  [0.2, 0.14],
  [0.42, 0.06],
  [0.75, 0.025],
];

/** Número de puntos que forman la estela detrás de la luz. */
const TRAIL_DOT_COUNT = 6;

/** Milisegundos que tarda el brillo de un nodo en apagarse por completo. */
const GLOW_DECAY_MS = 700;

interface NodeVisual {
  readonly material: MeshStandardMaterial;
  readonly wireframe: LineBasicMaterial;
  readonly innerMaterial: MeshBasicMaterial;
  readonly halo: Sprite;
  readonly matrix: MatrixTexture;
  glow: number;
}

/**
 * Construye la escena de fondo del isotipo AVIX sobre un canvas existente.
 *
 * Toda la interacción es imperativa y a 60 fps: la escena se pilota desde el
 * bucle de scroll (`useScrollScene`), no desde el estado de React. Ver
 * AGENTS.md → «La excepción imperativa».
 */
export function createAvixScene(canvas: HTMLCanvasElement): AvixScene | null {
  const renderer = createRenderer(canvas);
  if (!renderer) return null;

  applyLegacyColorPipeline(renderer);

  const scene = new Scene();
  scene.fog = new FogExp2(PALETTE.background, 0.038);

  const camera = new PerspectiveCamera(42, 1, 0.1, 100);

  const governor = createPerformanceGovernor();
  const pixelRatioCap = resolvePixelRatioCap();

  const applyResolution = (): void => {
    const ratio = Math.min(window.devicePixelRatio || 1, pixelRatioCap) * governor.scale;
    renderer.setPixelRatio(ratio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  applyResolution();
  window.addEventListener('resize', applyResolution);

  // --- Iluminación -----------------------------------------------------------
  scene.add(new AmbientLight(0x22384c, 1.15 * LEGACY_LIGHT_SCALE));
  const keyLight = new DirectionalLight(0x9db8d6, 0.85 * LEGACY_LIGHT_SCALE);
  keyLight.position.set(6, 10, 8);
  scene.add(keyLight);

  const travellingLight = new PointLight(
    PALETTE.glow,
    1.4 * LEGACY_LIGHT_SCALE,
    POINT_LIGHT_FALLOFF.distance,
    POINT_LIGHT_FALLOFF.decay,
  );
  scene.add(travellingLight);

  // --- Recursos compartidos --------------------------------------------------
  const cubeGeometry = new BoxGeometry(1, 1, 1);
  const edgeGeometry = new EdgesGeometry(cubeGeometry);
  const glowTexture = createGlowTexture();
  const disposables: { dispose(): void }[] = [cubeGeometry, edgeGeometry, glowTexture];

  const track = <T extends { dispose(): void }>(resource: T): T => {
    disposables.push(resource);
    return resource;
  };

  const newGlowSprite = (scale: number, depthTest = true): Sprite => {
    const sprite = new Sprite(
      track(
        new SpriteMaterial({
          map: glowTexture,
          transparent: true,
          opacity: 0,
          blending: AdditiveBlending,
          depthWrite: false,
          depthTest,
        }),
      ),
    );
    sprite.scale.setScalar(scale);
    scene.add(sprite);
    return sprite;
  };

  // --- Nodos del isotipo -----------------------------------------------------
  const nodes = new Map<NodeId, NodeVisual>();

  for (const id of NODE_IDS) {
    const position = NODE_POSITIONS[id];
    const size = NODE_SIZES[id];

    const material = track(
      new MeshStandardMaterial({
        color: NODE_COLORS[id],
        roughness: 0.5,
        metalness: 0.3,
        emissive: PALETTE.glow,
        emissiveIntensity: 0,
      }),
    );

    const mesh = new Mesh(cubeGeometry, material);
    mesh.frustumCulled = false;
    mesh.position.set(...position);
    mesh.scale.setScalar(size);
    // El cubo central queda alineado; los brazos se inclinan levemente para que
    // el conjunto no se lea como una cruz perfecta.
    if (id !== 'C') mesh.rotation.set(position[2] * 0.07, position[0] * 0.09, position[1] * 0.05);

    const wireframe = track(
      new LineBasicMaterial({ color: 0x66eaff, transparent: true, opacity: 0 }),
    );
    const wireframeMesh = new LineSegments(edgeGeometry, wireframe);
    wireframeMesh.scale.setScalar(1.002);
    mesh.add(wireframeMesh);

    const matrix = track(createMatrixTexture());
    const innerMaterial = track(
      new MeshBasicMaterial({
        map: matrix.texture,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    const innerMesh = new Mesh(cubeGeometry, innerMaterial);
    innerMesh.scale.setScalar(1.004);
    mesh.add(innerMesh);

    const halo = newGlowSprite(size * 4.2);
    halo.position.copy(mesh.position);

    scene.add(mesh);
    nodes.set(id, { material, wireframe, innerMaterial, halo, matrix, glow: 0 });
  }

  // --- Brazos: tubos apilados con mezcla aditiva -----------------------------
  const softTubeMaterials = SOFT_TUBE_LAYERS.map(([, opacity]) =>
    track(
      new MeshBasicMaterial({
        color: 0x1b8aa3,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );

  const curves = new Map<string, LineCurve3>();
  const edgeKey = (a: NodeId, b: NodeId): string => `${a}>${b}`;

  for (const [a, b] of EDGES) {
    const curve = new LineCurve3(
      new Vector3(...NODE_POSITIONS[a]),
      new Vector3(...NODE_POSITIONS[b]),
    );
    curves.set(edgeKey(a, b), curve);

    SOFT_TUBE_LAYERS.forEach(([radius], layer) => {
      const geometry = track(new TubeGeometry(curve, 2, radius, 7, false));
      const material = softTubeMaterials[layer];
      if (!material) return;
      const tube = new Mesh(geometry, material);
      tube.frustumCulled = false;
      scene.add(tube);
    });
  }

  // --- Satélites -------------------------------------------------------------
  const satelliteMaterials = new Map<number, MeshStandardMaterial>();
  for (const [x, y, z, scale, color] of SATELLITES) {
    let material = satelliteMaterials.get(color);
    if (!material) {
      material = track(new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.25 }));
      satelliteMaterials.set(color, material);
    }
    const mesh = new Mesh(cubeGeometry, material);
    mesh.frustumCulled = false;
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    mesh.rotation.set(y * 0.3, x, z * 0.2);
    scene.add(mesh);
  }

  // --- Luz viajera y estela --------------------------------------------------
  const trailDots = Array.from({ length: TRAIL_DOT_COUNT }, () => newGlowSprite(0.55, false));
  const lightSprite = newGlowSprite(2.2, false);

  const traversal = createLightTraversal();
  const scratch = new Vector3();
  const cameraTarget = new Vector3();
  // Vectores de trabajo del tramo recto. Se reutilizan porque `pointOnEdge` se
  // llama siete veces por fotograma y crear vectores ahí alimentaría al
  // recolector de basura dentro del bucle que menos puede permitírselo.
  const scratchFrom = new Vector3();
  const scratchTo = new Vector3();
  let previousNow = 0;

  /** Interpola entre dos nodos siguiendo la arista que los une. */
  const pointOnEdge = (from: NodeId, to: NodeId, t: number, out: Vector3): Vector3 => {
    // La luz está parada en un nodo: no hay arista que recorrer. Es el caso
    // más frecuente —toda la fase `hold`— y no necesita ninguna interpolación.
    if (from === to) return out.set(...NODE_POSITIONS[from]);

    const forward = curves.get(edgeKey(from, to));
    if (forward) return forward.getPointAt(t, out);

    const backward = curves.get(edgeKey(to, from));
    if (backward) return backward.getPointAt(1 - t, out);

    // `from` y `to` no son adyacentes: recta entre ambos.
    return out.lerpVectors(
      scratchFrom.set(...NODE_POSITIONS[from]),
      scratchTo.set(...NODE_POSITIONS[to]),
      t,
    );
  };

  const setGlow = (id: NodeId, value: number): void => {
    const node = nodes.get(id);
    if (!node) return;
    node.glow = value;
    node.material.emissiveIntensity = value * 0.9;
    node.innerMaterial.opacity = value;
    node.wireframe.opacity = value;
    node.halo.material.opacity = value * 0.85;
    node.halo.scale.setScalar(NODE_SIZES[id] * (3.4 + value * 1.6));
  };

  /**
   * Riel orbital isométrico: mantiene el ángulo del isotipo mientras la cámara
   * panea y se acerca a lo largo de la página.
   */
  const moveCamera = (progress: number): void => {
    const t = clamp01(progress / LAST_SCROLL_SEGMENT);
    const azimuth = lerp(-0.85, 0.85, t);
    const radius = lerp(21, 13, t);
    const elevation = 0.62;

    camera.position.set(
      radius * Math.sin(azimuth) * Math.cos(elevation * 0.6) + lerp(-2, 2, t),
      radius * Math.sin(elevation),
      radius * Math.cos(azimuth) * Math.cos(elevation * 0.6),
    );
    cameraTarget.set(lerp(-2.6, 2.4, t), lerp(0.8, -0.5, t), 0);
    camera.lookAt(cameraTarget);
  };

  return {
    update({ cameraProgress, segmentIndex, now, cameraMotion, travellingLight: lightVisible }) {
      const deltaMs = previousNow ? Math.min(60, now - previousNow) : 16;
      previousNow = now;

      if (governor.sample(deltaMs)) applyResolution();
      if (cameraMotion) moveCamera(cameraProgress);

      traversal.targetSegment(segmentIndex);

      travellingLight.visible = lightVisible;
      lightSprite.visible = lightVisible;
      if (lightVisible) traversal.advance(deltaMs);

      const { from, to, phase, progress } = traversal.state;

      // El brillo de cada nodo decae por sí solo; los nodos activos lo reponen.
      for (const [id, node] of nodes) {
        if (node.glow > 0) setGlow(id, Math.max(0, node.glow - deltaMs / GLOW_DECAY_MS));
        if (node.glow > 0.02) node.matrix.draw(deltaMs);
      }

      if (lightVisible) {
        if (phase === 'hold') {
          setGlow(from, 0.88 + 0.12 * Math.sin(now / 160));
        } else {
          const fromNode = nodes.get(from);
          const toNode = nodes.get(to);
          setGlow(from, Math.max(fromNode?.glow ?? 0, clamp01(1 - progress * 1.3)));
          setGlow(to, Math.max(toNode?.glow ?? 0, clamp01((progress - 0.72) / 0.28)));
        }
      }

      pointOnEdge(from, to, progress, travellingLight.position);
      lightSprite.position.copy(travellingLight.position);

      const isTravelling = phase === 'travel';
      lightSprite.material.opacity = isTravelling ? 0.9 : 0;
      travellingLight.intensity = (isTravelling ? 2.2 : 1.2) * LEGACY_LIGHT_SCALE;

      trailDots.forEach((dot, index) => {
        const position = (index + 1) / (TRAIL_DOT_COUNT + 1);
        pointOnEdge(from, to, position, dot.position);
        const lit =
          isTravelling && progress >= position ? clamp01(1 - (progress - position) * 2.2) : 0;
        dot.material.opacity = isTravelling ? 0.15 + lit * 0.75 : 0;
      });

      renderer.render(scene, camera);

      if (!lightVisible) return null;

      const projected = scratch.copy(travellingLight.position).project(camera);
      return {
        x: (projected.x * 0.5 + 0.5) * window.innerWidth,
        y: (-projected.y * 0.5 + 0.5) * window.innerHeight,
      };
    },

    dispose(): void {
      window.removeEventListener('resize', applyResolution);

      scene.traverse((object: Object3D) => {
        if (!(object instanceof Mesh) && !(object instanceof LineSegments)) return;
        const material = object.material as Material | Material[];
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      });

      for (const resource of disposables) resource.dispose();
      scene.clear();
      renderer.dispose();
    },
  };
}
