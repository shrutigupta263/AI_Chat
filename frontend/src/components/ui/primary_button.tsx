import { ButtonHTMLAttributes, forwardRef } from 'react';
import { classNames } from '@/utils/class_names';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      disabled={disabled}
        className={classNames(
          'inline-flex h-[54px] w-full items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary)] px-6 text-base font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/30',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:-translate-y-[1px] hover:shadow-xl hover:bg-[#4338CA]',
          className,
        )}
    >
      {children}
    </button>
  ),
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
