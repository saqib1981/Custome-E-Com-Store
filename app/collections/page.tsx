import { Suspense } from 'react'
import CollectionsList from '@/components/CollectionsList'

function CollectionsListFallback() {
  return <div className="px-4 py-10 text-center text-sm text-gray-500">Loading collections…</div>
}

export default function CollectionsPage() {
  return (
    <>
      <h1 className="sr-only">Collections</h1>
      <Suspense fallback={<CollectionsListFallback />}>
        <CollectionsList />
      </Suspense>
    </>
  )
}
