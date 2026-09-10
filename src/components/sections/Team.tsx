import Image from 'next/image';

import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';
import { PARTNERS } from '@/content/team';

import styles from './Team.module.css';

/**
 * «Nosotros» — los dos socios.
 *
 * Mientras `portrait` no esté definido en `content/team.ts` se dibuja un
 * marcador con la inicial en lugar de la fotografía; basta con añadir la imagen
 * a `public/` y apuntar a ella para que aparezca.
 */
export function Team() {
  return (
    <Section id="equipo" className={styles.section}>
      <Eyebrow>Nosotros</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        Hablas con quienes entienden el problema y construyen la solución.
      </Reveal>

      <Reveal delay={0.2} as="p" className={styles.intro}>
        Sin pasar tu operación por cinco intermediarios.
      </Reveal>

      <div className={styles.partners}>
        {PARTNERS.map(({ name, role, bio, credentials, portrait }, index) => (
          <Reveal
            key={name}
            delay={index === 0 ? 0.25 : 0.1}
            className={index > 0 ? styles.partnerOffset : undefined}
          >
            <div className={styles.portraitFrame}>
              {portrait ? (
                <Image
                  src={portrait}
                  alt={`Retrato de ${name}`}
                  fill
                  className={styles.portrait}
                  sizes="(max-width: 860px) 100vw, 50vw"
                />
              ) : (
                <div className={styles.portraitPlaceholder} aria-hidden="true">
                  {name.charAt(0)}
                </div>
              )}
              <div className={styles.portraitScrim} />
              <div className={styles.portraitCaption}>
                <div className={styles.role}>{role}</div>
                <h3 className={styles.name}>{name}</h3>
              </div>
            </div>
            <p className={styles.bio}>{bio}</p>
            <p className={styles.credentials}>{credentials}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
