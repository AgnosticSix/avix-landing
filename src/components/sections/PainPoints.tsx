import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow, Section } from '@/components/ui/Section';

import styles from './PainPoints.module.css';

/**
 * «¿Te suena?» — seis situaciones cotidianas que el visitante debería
 * reconocer, cada una ilustrada con un pequeño simulacro de interfaz.
 *
 * Los simulacros son puramente decorativos y varían en forma, así que viven
 * aquí como componentes en lugar de en `content/`: no son datos que alguien de
 * marketing pueda editar sin tocar el diseño. El texto de cada tarjeta sí lo es.
 */

const CHAT_BUBBLES = ['¿Ya quedó lo del cliente?', 'Déjame preguntar…'] as const;

function ChatMockup() {
  return (
    <div className={styles.stack} aria-hidden="true">
      <span className={styles.bubbleIn}>{CHAT_BUBBLES[0]}</span>
      <span className={styles.bubbleOut}>{CHAT_BUBBLES[1]}</span>
    </div>
  );
}

const SHEET_HEADERS = ['Cliente', 'Estado', 'Fecha', 'Resp.'] as const;
const SHEET_ROWS = [
  ['Gómez', '?', '03/09', '—'],
  ['Ruiz', 'Pend.', '—', '¿Ana?'],
] as const;

function SpreadsheetMockup() {
  return (
    <div className={styles.sheet} aria-hidden="true">
      {SHEET_HEADERS.map((header) => (
        <span key={header} className={styles.sheetHead}>
          {header}
        </span>
      ))}
      {SHEET_ROWS.map((row, rowIndex) =>
        row.map((cell, cellIndex) => (
          <span
            key={`${rowIndex}-${cellIndex}`}
            // El interrogante marca el dato que nadie ha rellenado: se resalta.
            className={cell === '?' ? styles.sheetCellFlagged : styles.sheetCell}
          >
            {cell}
          </span>
        )),
      )}
    </div>
  );
}

const INBOX_ROWS = [
  { text: 'RE: RE: seguimiento proveedor', unread: true },
  { text: '¿Alguien le contestó a Laura?', unread: true },
  { text: 'Recordatorio: llamar el viernes', unread: false },
] as const;

function InboxMockup() {
  return (
    <div className={styles.inbox} aria-hidden="true">
      {INBOX_ROWS.map(({ text, unread }) => (
        <span key={text} className={unread ? styles.inboxRow : styles.inboxRowMuted}>
          <span className={unread ? styles.inboxDot : styles.inboxDotEmpty} />
          {text}
        </span>
      ))}
    </div>
  );
}

/** Alturas de las barras, en porcentaje. La última es la del informe en curso. */
const CHART_BARS = [40, 65, 50, 80, 30] as const;

function ReportMockup() {
  return (
    <div className={styles.chart} aria-hidden="true">
      {CHART_BARS.map((height, index) => (
        <span
          key={index}
          className={index === CHART_BARS.length - 1 ? styles.barAccent : styles.bar}
          style={{ height: `${height}%` }}
        />
      ))}
      <span className={styles.fileName}>reporte_lunes_v7.xlsx</span>
    </div>
  );
}

function CustomerMockup() {
  return (
    <div className={styles.stack} aria-hidden="true">
      <span className={styles.bubbleIn}>Hola, ¿cómo va mi trámite?</span>
      <span className={styles.bubbleSearching}>Buscando en 3 carpetas…</span>
    </div>
  );
}

const DOCUMENTS = [
  { name: 'Identificación', status: 'ok' },
  { name: 'Comprobante', status: 'ok' },
  { name: 'Firma', status: 'missing' },
] as const;

function DocumentsMockup() {
  return (
    <div className={styles.checklist} aria-hidden="true">
      {DOCUMENTS.map(({ name, status }) => (
        <span key={name} className={status === 'ok' ? styles.checkRow : styles.checkRowMissing}>
          {name}
          <span className={status === 'ok' ? styles.checkOk : styles.checkMissing}>
            {status === 'ok' ? '✓' : 'falta'}
          </span>
        </span>
      ))}
    </div>
  );
}

const PAIN_POINTS = [
  { Mockup: ChatMockup, text: 'Una tarea no avanza hasta que alguien pregunta: “¿ya quedó?”' },
  { Mockup: SpreadsheetMockup, text: 'Alguien copia datos de un sistema a otro.' },
  { Mockup: InboxMockup, text: 'Una persona tiene que recordar a quién darle seguimiento.' },
  { Mockup: ReportMockup, text: 'Cada semana alguien arma el mismo reporte.' },
  {
    Mockup: CustomerMockup,
    text: 'Los clientes preguntan por algo que tu equipo tiene que buscar manualmente.',
  },
  {
    Mockup: DocumentsMockup,
    text: 'Los documentos se revisan uno por uno para detectar qué falta.',
  },
] as const;

export function PainPoints() {
  return (
    <Section id="te-suena" className={styles.section}>
      <Eyebrow>¿Te suena?</Eyebrow>

      <Reveal delay={0.1} as="h2" className={styles.heading}>
        Si esto pasa todos los días, probablemente hay algo que podemos automatizar.
      </Reveal>

      <Reveal delay={0.2} className={styles.grid}>
        {PAIN_POINTS.map(({ Mockup, text }) => (
          <div key={text} className={styles.card}>
            <Mockup />
            <p className={styles.cardText}>{text}</p>
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.2} className={styles.closing}>
        <h2 className={styles.closingHeading}>La IA puede hacer mucho más que redactar textos.</h2>
        <p className={styles.closingBody}>
          Puede leer información, clasificarla, actualizar sistemas, dar seguimiento, generar
          documentos, detectar pendientes, enviar avisos y pedir ayuda cuando necesita una decisión
          humana.
        </p>
      </Reveal>
    </Section>
  );
}
