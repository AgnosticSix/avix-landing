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
