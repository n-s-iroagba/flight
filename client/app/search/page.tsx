import { Suspense } from 'react';
import SearchResultsClient from './SearchResultsClient';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-text-primary p-8 text-center">Loading flights...</div>}>
      <SearchResultsClient />
    </Suspense>
  );
}
