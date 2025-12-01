import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/utils/class_names';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ icon, className, ...props }, ref) => (
    <div className="relative w-full">
      {icon && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className={classNames(
          'h-[54px] w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white/90',
          'px-4 text-base text-[var(--text-dark)] placeholder:text-[var(--text-muted)]',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/15',
          'focus-visible:border-[var(--color-primary)] transition-colors',
          icon ? 'pl-12' : '',
          className,
        )}
      />
    </div>
  ),
);

TextInput.displayName = 'TextInput';

export default TextInput;
