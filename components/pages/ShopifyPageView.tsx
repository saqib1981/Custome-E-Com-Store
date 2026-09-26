import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import type { ShopifyOnlinePage } from '@/lib/shopify-pages'

type ShopifyPageViewProps = {
  page: ShopifyOnlinePage
}

export default function ShopifyPageView({ page }: ShopifyPageViewProps) {
  return (
    <article className={`mx-auto w-full max-w-3xl ${STORE_SECTION_EDGE_CLASS} py-8 sm:py-10`}>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
        {page.title}
      </h1>
      {page.bodyHtml ? (
        <div
          className="shopify-page-body text-sm leading-relaxed text-gray-700 sm:text-base"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      ) : (
        <p className="text-sm text-gray-500">This page has no content yet.</p>
      )}
    </article>
  )
}
