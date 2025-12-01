import { forwardRef, SelectHTMLAttributes } from 'react';
import { classNames } from '@/utils/class_names';

interface DropdownSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const DropdownSelect = forwardRef<HTMLSelectElement, DropdownSelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        {...props}
        className={classNames(
          'h-[54px] w-full appearance-none rounded-[var(--radius-input)] border border-[var(--border)] bg-white/90',
          'px-4 pr-12 text-base text-[var(--text-dark)] placeholder:text-[var(--text-muted)]',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/15',
          'focus-visible:border-[var(--color-primary)] transition-colors',
          className,
        )}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
        ▾
      </span>
    </div>
  ),
);

DropdownSelect.displayName = 'DropdownSelect';

export default DropdownSelect;
