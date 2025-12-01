import { ReactNode } from 'react';
import UiCard from './ui_card';
import { classNames } from '@/utils/class_names';

interface AiSuggestionCardProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export default function AiSuggestionCard({
  title = 'AI Suggestions',
  description,
  className,
  children,
}: AiSuggestionCardProps) {
  return (
    <UiCard
      padding="md"
      className={classNames('space-y-4 bg-[var(--color-primary-light)]/40 lg:sticky lg:top-6', className)}
    >
      <div>
        <p className="text-sm font-semibold text-[var(--color-primary)]">✨ {title}</p>
        {description && <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>}
      </div>
      <div className="space-y-3 text-sm text-[var(--text-dark)]">{children}</div>
    </UiCard>
  );
}
