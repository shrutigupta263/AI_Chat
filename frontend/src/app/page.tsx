'use client';

import { useFormStore } from '@/store/form_store';
import FormWizard from '@/components/form_wizard';
import SummaryPage from '@/components/summary_page';

export default function Home() {
  const { isComplete } = useFormStore();

  return (
    <main className="min-h-screen bg-background text-text-dark">
      {isComplete ? <SummaryPage /> : <FormWizard />}
    </main>
  );
}

