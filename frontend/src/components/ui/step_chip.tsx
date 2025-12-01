import { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/utils/class_names';

interface StepChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive?: boolean;
  isComplete?: boolean;
  stepNumber?: number;
}

export default function StepChip({
  label,
  isActive,
  isComplete,
  stepNumber,
  className,
  ...props
}: StepChipProps) {
  return (
    <button
      type="button"
      {...props}
      className={classNames(
        'ugc-step-chip flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
        isActive
          ? 'border-[#C7D2FE] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
          : 'border-transparent bg-white text-[var(--text-muted)]',
        isComplete && !isActive ? 'text-[var(--text-dark)]' : '',
        'shadow-sm transition-all',
        className,
      )}
    >
      {stepNumber !== undefined && (
        <span
          className={classNames(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
            isActive || isComplete ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-[var(--text-muted)]',
          )}
        >
          {stepNumber}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
