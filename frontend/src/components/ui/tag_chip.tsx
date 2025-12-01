import { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/utils/class_names';

interface TagChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function TagChip({ active, className, children, ...props }: TagChipProps) {
  return (
    <button
      type="button"
      {...props}
      className={classNames(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
          : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--color-primary)]/60 hover:text-[var(--text-dark)]',
        className,
      )}
    >
      {children}
    </button>
  );
}
