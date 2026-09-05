import Link from 'next/link'
import type { Metadata } from 'next'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center py-16 text-center sm:py-24">
        <p className="text-sm font-semibold tracking-wide text-gray-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
          The page you are looking for does not exist, was moved, or the link is broken.
          Head back to the store to keep shopping.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Go to home page
          </Link>
          <Link
            href="/collections"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Browse collections
          </Link>
        </div>
      </div>
    </section>
  )
}
