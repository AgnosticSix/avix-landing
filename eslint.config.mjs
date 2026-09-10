import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/**
 * Configuración de ESLint (formato plano).
 *
 * `eslint-config-next` 16 ya exporta configuraciones planas, así que se
 * importan directamente en lugar de pasar por `FlatCompat`.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'reference/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-param-reassign': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /*
       * Accesibilidad. `next/core-web-vitals` sólo activa seis reglas de
       * `jsx-a11y`; éstas cubren los fallos que de verdad pueden aparecer en
       * una landing con formulario, pestañas y elementos decorativos.
       */
      'jsx-a11y/label-has-associated-control': ['error', { assert: 'either', depth: 3 }],
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/media-has-caption': 'error',

      /*
       * `no-autofocus` queda desactivada tras revisar su único uso. La regla
       * protege del `autoFocus` al cargar la página, que desorienta a quien
       * navega con lector de pantalla. En el cuestionario de diagnóstico el
       * foco sólo se mueve al pasar de pregunta (`stepIndex > 0`), nunca en la
       * carga inicial: ahí llevar el foco al campo siguiente es justamente lo
       * que se espera, y el cambio se anuncia con `aria-live` en el indicador
       * de progreso. Si aparece otro `autoFocus`, revísalo antes de asumir que
       * está cubierto por esta excepción.
       */
      'jsx-a11y/no-autofocus': 'off',
    },
  },
];

export default config;
