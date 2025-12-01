import { forwardRef, TextareaHTMLAttributes } from 'react';
import { classNames } from '@/utils/class_names';

interface MultilineTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const MultilineTextarea = forwardRef<HTMLTextAreaElement, MultilineTextareaProps>(
  ({ className, rows = 6, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      {...props}
      className={classNames(
        'w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white/90 px-4 py-3',
        'text-base text-[var(--text-dark)] placeholder:text-[var(--text-muted)]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/15',
        'focus-visible:border-[var(--color-primary)] transition-colors resize-y',
        'min-h-[140px]',
        className,
      )}
    />
  ),
);

MultilineTextarea.displayName = 'MultilineTextarea';

export default MultilineTextarea;
