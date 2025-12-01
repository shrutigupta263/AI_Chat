import { ButtonHTMLAttributes, forwardRef } from 'react';
import { classNames } from '@/utils/class_names';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
}

const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, disabled, children, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      disabled={disabled}
      className={classNames(
        'inline-flex h-[54px] items-center justify-center rounded-[var(--radius-input)] px-6 text-base font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/15',
        variant === 'ghost'
          ? 'border border-transparent bg-transparent text-[var(--text-dark)] hover:text-[var(--color-primary)]'
          : 'border border-[var(--border)] bg-white text-[var(--text-dark)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        disabled ? 'cursor-not-allowed opacity-60 hover:border-[var(--border)] hover:text-[var(--text-dark)]' : '',
        className,
      )}
    >
      {children}
    </button>
  ),
);

SecondaryButton.displayName = 'SecondaryButton';

export default SecondaryButton;

