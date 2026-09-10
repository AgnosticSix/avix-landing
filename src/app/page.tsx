import { SiteFooter } from '@/components/layout/SiteFooter';
import { TopNav } from '@/components/layout/TopNav';
import { Backdrop } from '@/components/scene/Backdrop';
import { SceneController } from '@/components/scene/SceneController';
import { Agents } from '@/components/sections/Agents';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { Capabilities } from '@/components/sections/Capabilities';
import { Discovery } from '@/components/sections/Discovery';
import { Faq } from '@/components/sections/Faq';
import { Fit } from '@/components/sections/Fit';
import { Hero } from '@/components/sections/Hero';
import { Industries } from '@/components/sections/Industries';
import { PainPoints } from '@/components/sections/PainPoints';
import { Process } from '@/components/sections/Process';
import { Team } from '@/components/sections/Team';
import { serializeStructuredData } from '@/lib/structured-data';

/**
 * Página única de AVIX.
 *
 * El orden de las secciones es el argumento de venta: primero el problema
 * reconocible, después la solución, luego las pruebas y por último la llamada
 * a la acción. `useScrollScene` da por hecho este mismo orden para mover la
 * cámara del fondo 3D, así que reordenar aquí exige actualizar `SECTION_IDS`.
 */
export default function HomePage() {
  return (
    <>
      {/*
        Datos estructurados. Van aquí y no en el layout porque el layout también
        envuelve a `not-found.tsx`, que se sirve con `noindex`: describir la
        entidad AVIX en una página que nadie debe indexar no aporta nada.

        Un `<script>` es inerte para la maquetación —el navegador le aplica
        `display: none`— y ni `body` es contenedor flex/grid ni hay selectores
        `:nth-child` en el proyecto, así que añadir un hermano aquí no mueve
        nada. Comprobado antes de insertarlo.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData() }}
      />

      <SceneController />
      <Backdrop />
      <TopNav />

      <main>
        <Hero />
        <PainPoints />
        <BeforeAfter />
        <Capabilities />
        <Agents />
        <Industries />
        <Process />
        <Team />
        <Fit />
        <Faq />
        <Discovery />
      </main>

      <SiteFooter />
    </>
  );
}
