import { Suspense } from 'react'
import ProductPage from '@/components/ProductPage'

type ProductHandlePageProps = {
  params: { handle: string }
}

function ProductPageFallback() {
  return (
    <div className="px-4 py-10 text-center text-sm text-gray-500 sm:px-6">Loading product…</div>
  )
}

export default function ProductHandlePage({ params }: ProductHandlePageProps) {
  const handle = decodeURIComponent(params.handle || 'example')

  return (
    <Suspense fallback={<ProductPageFallback />}>
      <ProductPage handle={handle} />
    </Suspense>
  )
}
