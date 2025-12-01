'use client';

import { Question } from '@/config/questions';
import TextInput from '@/components/ui/text_input';
import MultilineTextarea from '@/components/ui/multiline_textarea';
import DropdownSelect from '@/components/ui/dropdown_select';

interface FormFieldProps {
  question: Question;
  value?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
}

export default function FormField({
  question,
  value = '',
  onChange,
  onFocus,
  disabled = false,
}: FormFieldProps) {
  const helperText = question.placeholder || '';

  const renderInput = () => {
    if (question.type === 'textarea') {
      return (
        <MultilineTextarea
          value={value}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          placeholder={helperText || 'Type your answer...'}
          disabled={disabled}
          rows={6}
        />
      );
    }

    if (question.type === 'dropdown') {
      return (
        <DropdownSelect
          value={value}
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">Select an option...</option>
          {(question.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </DropdownSelect>
      );
    }

    return (
      <TextInput
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={helperText || 'Type your answer...'}
        disabled={disabled}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-base font-semibold text-[var(--text-dark)]">{question.title}</label>
        {helperText && <p className="mt-1 text-sm text-[var(--text-muted)]">{helperText}</p>}
      </div>
      {renderInput()}
    </div>
  );
}


