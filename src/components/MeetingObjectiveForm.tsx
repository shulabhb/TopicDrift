import { useEffect, useId, useRef, useState } from 'react';
import { OBJECTIVE_MAX_LENGTH, validateObjective } from '@/src/types/session';
import './panel.css';

export interface MeetingObjectiveFormProps {
  initialValue?: string;
  onSubmit: (objective: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  errorCode?: string | null;
}

function objectiveErrorMessage(code: string | null | undefined): string | null {
  switch (code) {
    case 'objective-required':
      return 'Enter a meeting objective to continue.';
    case 'objective-too-long':
      return `Objective must be ${OBJECTIVE_MAX_LENGTH} characters or fewer.`;
    default:
      return code ? 'Unable to save the objective.' : null;
  }
}

export function MeetingObjectiveForm({
  initialValue = '',
  onSubmit,
  onCancel,
  disabled = false,
  errorCode = null,
}: MeetingObjectiveFormProps) {
  const [value, setValue] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const labelId = useId();
  const remaining = OBJECTIVE_MAX_LENGTH - value.length;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const submit = () => {
    const validation = validateObjective(value);
    if (!validation.ok) {
      setLocalError(objectiveErrorMessage(validation.error));
      return;
    }

    setLocalError(null);
    onSubmit(value);
  };

  const displayError = localError ?? objectiveErrorMessage(errorCode);

  return (
    <section className="td-panel" role="form" aria-labelledby={labelId}>
      <h2 id={labelId} className="td-panel__title">
        What should this meeting accomplish?
      </h2>
      <p className="td-panel__body">
        Example: Finalize the launch timeline and assign owners.
      </p>

      <div className="td-field">
        <label htmlFor="td-objective-input" className="td-field__label">
          Meeting objective
        </label>
        <textarea
          id="td-objective-input"
          ref={textareaRef}
          value={value}
          disabled={disabled}
          maxLength={OBJECTIVE_MAX_LENGTH}
          aria-describedby="td-objective-help td-objective-error"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <p id="td-objective-help" className="td-meta">
          {remaining} characters remaining
        </p>
        {displayError ? (
          <p id="td-objective-error" className="td-error" role="alert">
            {displayError}
          </p>
        ) : null}
      </div>

      <div className="td-panel__actions">
        <button
          type="button"
          className="td-button td-button--primary"
          disabled={disabled}
          onClick={submit}
        >
          Save objective
        </button>
        <button type="button" className="td-button td-button--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}
