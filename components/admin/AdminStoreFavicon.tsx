'use client'

import StoreFavicon from '@/components/StoreFavicon'
import { useAdminEditor } from '@/context/AdminEditorContext'
import { useStoreTheme } from '@/context/StoreThemeContext'

/** Admin tab favicon — live saved favicon, with draft preview while editing. */
export default function AdminStoreFavicon() {
  const { logoFavicon } = useStoreTheme()
  const { activeGlobalSetting, logoFaviconDraft, logoFaviconSaved } = useAdminEditor()

  const faviconUrl =
    activeGlobalSetting === 'logo-favicon'
      ? logoFaviconDraft.faviconUrl || logoFaviconSaved.faviconUrl || logoFavicon.faviconUrl
      : logoFaviconSaved.faviconUrl || logoFavicon.faviconUrl

  return <StoreFavicon faviconUrl={faviconUrl} />
}
