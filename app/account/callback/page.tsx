'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'

function AccountCallbackInner() {
  const router = useRouter()
  const search = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = search.get('code')
    const state = search.get('state')
    const oauthError = search.get('error_description') || search.get('error')

    if (oauthError) {
      setError(oauthError)
      return
    }
    if (!code || !state) {
      setError('Missing login code from Shopify.')
      return
    }

    let cancelled = false
    void fetch('/api/store/account/otp/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { error?: string }
        if (!res.ok) throw new Error(data.error || 'Login failed')
        if (!cancelled) router.replace('/account')
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Login failed')
        }
      })

    return () => {
      cancelled = true
    }
  }, [router, search])

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <div className="mx-auto w-full max-w-md py-16 text-center">
        {error ? (
          <>
            <p className="text-sm text-red-700">{error}</p>
            <a href="/account" className="mt-4 inline-block text-sm font-medium underline">
              Back to login
            </a>
          </>
        ) : (
          <p className="text-sm text-gray-600">Confirming your email login…</p>
        )}
      </div>
    </section>
  )
}

export default function AccountCallbackPage() {
  return (
    <Suspense
      fallback={
        <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
          <div className="mx-auto w-full max-w-md py-16 text-center text-sm text-gray-600">
            Confirming your email login…
          </div>
        </section>
      }
    >
      <AccountCallbackInner />
    </Suspense>
  )
}
