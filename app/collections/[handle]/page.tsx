import { Suspense } from 'react'
import CollectionProducts from '@/components/CollectionProducts'

type CollectionHandlePageProps = {
  params: { handle: string }
}

function CollectionProductsFallback() {
  return (
    <div className="px-4 py-10 text-center text-sm text-gray-500 sm:px-6">Loading products…</div>
  )
}

export default function CollectionHandlePage({ params }: CollectionHandlePageProps) {
  const handle = decodeURIComponent(params.handle || 'all')

  return (
    <Suspense fallback={<CollectionProductsFallback />}>
      <CollectionProducts handle={handle} />
    </Suspense>
  )
}
