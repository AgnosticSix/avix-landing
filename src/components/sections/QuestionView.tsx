'use client';

import type { QuizQuestion } from '@/content/quiz';

import type { Answer, QuizAction } from './quiz-state';
import styles from './Discovery.module.css';

type Dispatch = (action: QuizAction) => void;

export interface QuestionViewProps {
  readonly question: QuizQuestion;
  readonly answers: Readonly<Record<string, Answer>>;
  readonly invalid: readonly string[];
  readonly dispatch: Dispatch;
  readonly autoFocus: boolean;
}

/**
 * Dibuja una pregunta según su tipo.
 *
 * Cada rama corresponde a una variante de `QuizQuestion`, así que añadir un
 * tipo nuevo al contenido obliga a TypeScript a señalar este `switch`.
 */
export function QuestionView({
  question,
  answers,
  invalid,
  dispatch,
  autoFocus,
}: QuestionViewProps) {
  switch (question.kind) {
    case 'text':
      return (
        <div className={styles.question}>
          <label className={styles.prompt} htmlFor={question.id}>
            {question.prompt}
          </label>
          <input
            id={question.id}
            name={question.name}
            type="text"
            className={styles.input}
            placeholder={question.placeholder}
            value={String(answers[question.name] ?? '')}
            aria-invalid={invalid.includes(question.name)}
            autoFocus={autoFocus}
            onChange={(event) =>
              dispatch({ type: 'answer', name: question.name, value: event.target.value })
            }
          />
        </div>
      );

    case 'textarea':
      return (
        <div className={styles.question}>
          <label className={styles.prompt} htmlFor={question.id}>
            {question.prompt}
          </label>
          <textarea
            id={question.id}
            name={question.name}
            rows={question.rows ?? 3}
            className={styles.textarea}
            placeholder={question.placeholder}
            value={String(answers[question.name] ?? '')}
            aria-invalid={invalid.includes(question.name)}
            autoFocus={autoFocus}
            onChange={(event) =>
              dispatch({ type: 'answer', name: question.name, value: event.target.value })
            }
          />
        </div>
      );

    case 'single':
    case 'multi': {
      const selected = answers[question.name];
      const isChecked = (option: string): boolean =>
        question.kind === 'multi'
          ? Array.isArray(selected) && selected.includes(option)
          : selected === option;

      return (
        <fieldset className={styles.question}>
          <legend className={styles.prompt}>{question.prompt}</legend>
          <div className={styles.chips}>
            {question.options.map((option) => (
              <label key={option} className={styles.chipLabel}>
                <input
                  className={styles.chipInput}
                  type={question.kind === 'multi' ? 'checkbox' : 'radio'}
                  name={question.name}
                  value={option}
                  checked={isChecked(option)}
                  onChange={() =>
                    dispatch({
                      type: question.kind === 'multi' ? 'toggle' : 'answer',
                      name: question.name,
                      value: option,
                    })
                  }
                />
                <span className={styles.chip}>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    case 'fields':
      return (
        <fieldset className={styles.question}>
          <legend className={styles.prompt}>{question.prompt}</legend>
          <div className={styles.fieldPair}>
            {question.fields.map((field, index) => (
              <input
                key={field.name}
                name={field.name}
                type="text"
                className={styles.input}
                placeholder={field.placeholder}
                aria-label={field.label}
                autoComplete={field.autoComplete}
                value={String(answers[field.name] ?? '')}
                aria-invalid={invalid.includes(field.name)}
                autoFocus={autoFocus && index === 0}
                onChange={(event) =>
                  dispatch({ type: 'answer', name: field.name, value: event.target.value })
                }
              />
            ))}
          </div>
        </fieldset>
      );
  }
}
