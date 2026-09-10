/**
 * Logotipo de AVIX.
 *
 * El trazo hereda `currentColor`, así que el color se fija desde el contenedor;
 * los dos puntos cian son fijos porque forman parte de la marca. Aparece en la
 * pantalla de carga, la barra de navegación y el pie, siempre con distinta
 * altura, de ahí que la única propiedad sea ésa.
 */
export function AvixLogo({
  height,
  className,
}: {
  readonly height: number;
  readonly className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1372 400"
      role="img"
      aria-label="AVIX"
      className={className}
      style={{ height, display: 'block' }}
    >
      <circle cx="46" cy="300" r="24" fill="none" stroke="currentColor" strokeWidth="22" />
      <path
        d="M 82 300 H 128 Q 152 300 166 280 L 272 128 Q 292 100 312 128 L 418 280 Q 432 300 456 300 H 500"
        fill="none"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="292" cy="248" r="17" fill="#00BCD4" />
      <path
        d="M 530 100 L 636 282 Q 648 302 660 282 L 758 114 Q 766 100 782 100 H 830"
        fill="none"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="890" cy="128" r="17" fill="#00BCD4" />
      <path
        d="M 890 190 V 272 Q 890 300 918 300 H 1022 L 1176 116 Q 1186 104 1202 104 H 1288"
        fill="none"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 952 104 H 1034 L 1188 288 Q 1198 300 1214 300 H 1252"
        fill="none"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="1326" cy="104" r="24" fill="none" stroke="currentColor" strokeWidth="22" />
    </svg>
  );
}
