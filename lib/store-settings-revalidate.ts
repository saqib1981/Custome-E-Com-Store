import { revalidatePath, revalidateTag } from 'next/cache'

/** Next.js cache tag for all store_settings-backed routes. */
export const STORE_SETTINGS_CACHE_TAG = 'store-settings'

/**
 * Bust App Router caches after a verified store_settings write.
 * Safe to call from API route handlers / server modules only.
 */
export function revalidateStoreSettings(key?: string): void {
  try {
    revalidateTag(STORE_SETTINGS_CACHE_TAG)
    if (key) revalidateTag(`store-settings:${key}`)
    revalidatePath('/', 'layout')
    revalidatePath('/myadmin', 'layout')
    revalidatePath('/checkout')
    revalidatePath('/cart')
    revalidatePath('/account')
    revalidatePath('/search')
  } catch (e) {
    // Outside of a Next request context (tests / scripts) — ignore
    console.warn('revalidateStoreSettings skipped:', e)
  }
}
