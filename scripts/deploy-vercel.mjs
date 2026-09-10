#!/usr/bin/env node
// Despliegue en Vercel por API REST: sin integración de Git y sin el CLI.
//
// Sube los archivos versionados (POST /v2/files) y crea el despliegue
// referenciándolos por SHA1 (POST /v13/deployments). El build lo hace Vercel,
// no esta máquina: eso es lo que garantiza que `process.env.VERCEL === '1'`
// durante el prerenderizado, condición con la que este proyecto decide montar
// @vercel/analytics y @vercel/speed-insights.
//
// El despliegue habitual lo hace `.github/workflows/deploy.yml` en cada push.
// Este script cubre los dos casos que quedan fuera: crear el proyecto la
// primera vez —el workflow necesita que ya exista— y publicar a mano si
// GitHub Actions no está disponible.
//
// Uso:
//   VERCEL_TOKEN=xxx VERCEL_ORG_ID=yyy node scripts/deploy-vercel.mjs
//   ... con --preview al final para publicar en una URL de preview.
//
// Variables de entorno:
//   VERCEL_TOKEN    (obligatoria) token de https://vercel.com/account/tokens
//   VERCEL_ORG_ID   (obligatoria) id del equipo; el proyecto vive en uno
//   VERCEL_PROJECT  nombre del proyecto en Vercel (por defecto: avix-sitio)

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const API = 'https://api.vercel.com';
const TOKEN = process.env.VERCEL_TOKEN;
// El proyecto en Vercel se llama `avix-sitio`, no como el repositorio: con
// el nombre equivocado esto no falla, crea un proyecto nuevo y despliega ahí.
const PROJECT = process.env.VERCEL_PROJECT ?? 'avix-sitio';
// El proyecto vive en un equipo, así que el identificador es obligatorio.
// VERCEL_ORG_ID es el nombre que usan el CLI y los secrets del workflow.
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? process.env.VERCEL_ORG_ID;
const TARGET = process.argv.includes('--preview') ? undefined : 'production';

if (!TOKEN) {
  console.error('Falta VERCEL_TOKEN. Créalo en https://vercel.com/account/tokens');
  process.exit(1);
}

if (!TEAM_ID) {
  console.error('Falta VERCEL_ORG_ID: sin él se desplegaría en la cuenta personal.');
  process.exit(1);
}

const query = (extra = {}) => {
  const params = new URLSearchParams(extra);
  if (TEAM_ID) params.set('teamId', TEAM_ID);
  const s = params.toString();
  return s ? `?${s}` : '';
};

const auth = { Authorization: `Bearer ${TOKEN}` };

// Las rutas se resuelven contra la raíz del repositorio, no contra el
// directorio desde el que se invoque el script.
const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });

// `git ls-files` da exactamente el contenido versionado: deja fuera
// node_modules, .next y todo lo que ignore .gitignore, sin listas paralelas
// que se desincronicen. `next-env.d.ts` está ignorado a propósito; Next lo
// regenera al arrancar el build.
function listFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'buffer' })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((f) => f !== '.gitignore');
}

async function readEntries(paths) {
  return Promise.all(
    paths.map(async (file) => {
      const data = await readFile(join(ROOT, file));
      return { file, data, sha: createHash('sha1').update(data).digest('hex'), size: data.length };
    }),
  );
}

// Un archivo por petición, con la huella SHA1 en la cabecera. Vercel responde
// 200 tanto si lo recibe como si ya lo tenía almacenado de un despliegue
// anterior, así que repetir despliegues sale barato.
async function uploadBlob({ data, sha, size }) {
  const res = await fetch(`${API}/v2/files${query()}`, {
    method: 'POST',
    headers: {
      ...auth,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': sha,
      'x-now-size': String(size),
    },
    body: data,
  });
  if (!res.ok) {
    throw new Error(`Subida fallida (${sha.slice(0, 8)}): ${res.status} ${await res.text()}`);
  }
}

async function uploadAll(entries) {
  // Contenidos idénticos comparten SHA: basta con subir cada uno una vez.
  const unique = [...new Map(entries.map((e) => [e.sha, e])).values()];
  const queue = [...unique];
  let done = 0;
  const worker = async () => {
    for (let next = queue.pop(); next; next = queue.pop()) {
      await uploadBlob(next);
      process.stdout.write(`\r  subidos ${++done}/${unique.length}`);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  process.stdout.write('\n');
}

async function createDeployment(entries) {
  // `project` apunta al proyecto existente y lo reutiliza; en la primera
  // ejecución Vercel lo crea con ese nombre. `projectSettings` sólo hace falta
  // la primera vez —Vercel lo guarda—, pero repetirlo es inocuo.
  const body = {
    name: PROJECT,
    project: PROJECT,
    target: TARGET,
    files: entries.map(({ file, sha, size }) => ({ file, sha, size })),
    projectSettings: {
      framework: 'nextjs',
      nodeVersion: '24.x',
      // null en el resto: que Vercel detecte pnpm por el lockfile y el campo
      // packageManager de package.json.
      installCommand: null,
      buildCommand: null,
      outputDirectory: null,
    },
  };

  // forceNew evita la deduplicación cuando reintentas con los mismos archivos;
  // skipAutoDetectionConfirmation evita el 400 si la detección de framework no
  // coincide con lo que ya tiene guardado el proyecto.
  const res = await fetch(
    `${API}/v13/deployments${query({ forceNew: '1', skipAutoDetectionConfirmation: '1' })}`,
    {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`Despliegue rechazado: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function waitUntilReady(id) {
  const deadline = Date.now() + 15 * 60 * 1000;
  let last = '';
  while (Date.now() < deadline) {
    const res = await fetch(`${API}/v13/deployments/${id}${query()}`, { headers: auth });
    const json = await res.json();
    if (json.readyState !== last) {
      last = json.readyState;
      console.log(`  estado: ${last}`);
    }
    if (last === 'READY') return json;
    if (last === 'ERROR' || last === 'CANCELED') {
      throw new Error(`El build terminó en ${last}. Revisa los logs en el panel de Vercel.`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error('Tiempo de espera agotado.');
}

if (git('status', '--porcelain').trim()) {
  console.warn(
    'Aviso: hay cambios sin confirmar. Se desplegará el contenido del árbol de trabajo.\n',
  );
}

const paths = listFiles();
console.log(`Empaquetando ${paths.length} archivos versionados…`);
const entries = await readEntries(paths);

console.log('Subiendo a Vercel…');
await uploadAll(entries);

console.log(`Creando despliegue (${TARGET ?? 'preview'})…`);
const deployment = await createDeployment(entries);
console.log(`  id: ${deployment.id}`);

const ready = await waitUntilReady(deployment.id);
console.log(`\nListo: https://${ready.url}`);
if (ready.alias?.length) {
  console.log(`Alias: ${ready.alias.map((a) => `https://${a}`).join('\n       ')}`);
}
