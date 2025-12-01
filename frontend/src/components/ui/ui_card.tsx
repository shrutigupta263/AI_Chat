import { ReactNode } from 'react';
import { classNames } from '@/utils/class_names';

interface UiCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap: Record<NonNullable<UiCardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function UiCard({
  children,
  className,
  padding = 'lg',
}: UiCardProps) {
  return (
    <div
      className={classNames(
        'bg-white border border-[var(--border)] rounded-[var(--radius-card)] shadow-sm',
        'transition-transform duration-200',
        'hover:-translate-y-[1px]',
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
