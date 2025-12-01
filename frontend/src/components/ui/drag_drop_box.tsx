import { ReactNode } from 'react';
import { classNames } from '@/utils/class_names';

interface DragDropBoxProps {
  title: string;
  description?: string;
  helperText?: string;
  icon?: ReactNode;
  className?: string;
}

export default function DragDropBox({
  title,
  description,
  helperText,
  icon,
  className,
}: DragDropBoxProps) {
  return (
    <div className={classNames('ugc-drag-drop p-6 text-center', className)}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
        {icon || <span className="text-xl">⇪</span>}
      </div>
      <p className="text-base font-semibold text-[var(--text-dark)]">{title}</p>
      {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
      {helperText && <p className="mt-3 text-xs text-[var(--text-muted)]">{helperText}</p>}
    </div>
  );
}
