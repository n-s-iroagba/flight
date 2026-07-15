import { Suspense, use } from 'react';
import BookPageClient from './BookPageClient';

export const dynamic = 'force-dynamic';

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  return (
    <Suspense fallback={<div className="text-text-primary p-8 text-center">Loading booking details...</div>}>
      <BookPageClient id={id} />
    </Suspense>
  );
}
