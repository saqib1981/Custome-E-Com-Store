'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import AdminPanelShell from '@/components/admin/AdminPanelShell'
import ColorField from '@/components/admin/ColorField'
import {
  ImageUploadField,
  LogoWidthRow,
  SettingsCollapsibleSection,
} from '@/components/admin/LogoFaviconFields'
import { useAdminEditor } from '@/context/AdminEditorContext'
import HeaderMenuHighlightBlock from '@/components/admin/HeaderMenuHighlightBlock'
import {
  DEFAULT_HEADER_NAV_SETTINGS,
  createMenuItemHighlight,
  type HeaderMenuItemHighlight,
} from '@/lib/header-settings'
import {
  buildMenuCacheKey,
  STORE_MENU_REFRESH_EVENT,
} from '@/lib/store-menu-client'
import { SHOPIFY_REQUIRED_SCOPES } from '@/lib/shopify-scopes'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'

type ShopifyMenuOption = {
  id: string
  handle: string
  title: string
}

type ShopifyMenusResponse = {
  menus?: ShopifyMenuOption[]
  currentHandle?: string
  currentMenuId?: string
  error?: string | null
  connection?: {
    connected?: boolean
    ok?: boolean
    shop?: string
    shopName?: string
    message?: string | null
    missingScopes?: Array<{ handle: string; label: string }>
  }
}

export default function HeaderSettingsPanel() {
  const {
    closeSection,
    logoFaviconDraft,
    logoFaviconUploading,
    updateLogoFaviconDraft,
    uploadLogoFaviconImage,
    headerNavDraft,
    headerNavSaved,
    updateHeaderNavDraft,
    saveHeaderSection,
    headerSectionDirty,
    headerSectionSaving,
    headerSectionStatus,
  } = useAdminEditor()

  const [shopifyMenus, setShopifyMenus] = useState<ShopifyMenuOption[]>([])
  const [menusLoading, setMenusLoading] = useState(true)
  const [menusError, setMenusError] = useState<string | null>(null)
  const [fallbackHandle, setFallbackHandle] = useState('main-menu')
  const [connectedShop, setConnectedShop] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void fetch('/api/admin/shopify-menus', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load menus')
        return res.json() as Promise<ShopifyMenusResponse>
      })
      .then((data) => {
        if (cancelled) return
        setShopifyMenus(Array.isArray(data.menus) ? data.menus : [])
        if (data.currentHandle) setFallbackHandle(data.currentHandle)
        if (data.connection?.shopName) {
          setConnectedShop(data.connection.shopName)
        } else if (data.connection?.shop) {
          setConnectedShop(data.connection.shop)
        }
        if (data.error) setMenusError(data.error)
        else if (data.connection?.message) setMenusError(data.connection.message)
      })
      .catch(() => {
        if (!cancelled) {
          setMenusError('Could not load menus from Shopify. Check store credentials in .env.local.')
        }
      })
      .finally(() => {
        if (!cancelled) setMenusLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedMenuId = useMemo(() => {
    if (headerNavDraft.menuId) return headerNavDraft.menuId
    const handle = headerNavDraft.menuHandle || fallbackHandle
    return shopifyMenus.find((menu) => menu.handle === handle)?.id ?? ''
  }, [headerNavDraft.menuId, headerNavDraft.menuHandle, fallbackHandle, shopifyMenus])

  const handleSave = async () => {
    const menuChanged =
      headerNavDraft.menuId !== headerNavSaved.menuId ||
      headerNavDraft.menuHandle !== headerNavSaved.menuHandle
    const ok = await saveHeaderSection()
    if (ok && menuChanged) {
      window.dispatchEvent(
        new CustomEvent(STORE_MENU_REFRESH_EVENT, {
          detail: {
            menuId: headerNavDraft.menuId,
            menuHandle: headerNavDraft.menuHandle,
            menuKey: buildMenuCacheKey(headerNavDraft.menuId, headerNavDraft.menuHandle),
          },
        })
      )
    }
  }

  const updateMenuHighlight = (id: string, patch: Partial<HeaderMenuItemHighlight>) => {
    updateHeaderNavDraft({
      menuHighlights: headerNavDraft.menuHighlights.map((block) =>
        block.id === id ? { ...block, ...patch } : block
      ),
    })
  }

  const removeMenuHighlight = (id: string) => {
    updateHeaderNavDraft({
      menuHighlights: headerNavDraft.menuHighlights.filter((block) => block.id !== id),
    })
  }

  const addMenuHighlight = () => {
    updateHeaderNavDraft({
      menuHighlights: [...headerNavDraft.menuHighlights, createMenuItemHighlight()],
    })
  }

  const menuOptions = useMemo(() => {
    if (selectedMenuId && !shopifyMenus.some((menu) => menu.id === selectedMenuId)) {
      const handle = headerNavDraft.menuHandle || fallbackHandle
      return [
        ...shopifyMenus,
        {
          id: selectedMenuId,
          handle,
          title: handle || 'Selected menu',
        },
      ]
    }
    return shopifyMenus
  }, [shopifyMenus, selectedMenuId, headerNavDraft.menuHandle, fallbackHandle])

  const selectMenu = (menuId: string) => {
    const menu = menuOptions.find((item) => item.id === menuId)
    if (!menu) return
    updateHeaderNavDraft({ menuId: menu.id, menuHandle: menu.handle })
  }

  return (
    <AdminPanelShell
      title="Header"
      subtitle="Logo and navigation bar"
      onBack={closeSection}
      onSave={() => void handleSave()}
      saveDisabled={!headerSectionDirty}
      saving={headerSectionSaving}
      status={headerSectionStatus}
    >
      <SettingsCollapsibleSection title="Navigation menu" defaultOpen>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Choose which Shopify menu appears in the store header and mobile drawer.
          {connectedShop ? (
            <>
              {' '}
              Connected store: <span className="font-medium text-gray-700 dark:text-gray-300">{connectedShop}</span>
            </>
          ) : null}
        </p>
        <div className="pb-2">
          <label
            htmlFor="header-shopify-menu"
            className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            Menu
          </label>
          {menusLoading ? (
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-500 dark:border-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading menus from Shopify…
            </div>
          ) : menusError ? (
            <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <p>{menusError}</p>
              <div>
                <p className="mb-1 font-medium">Required scopes for every store:</p>
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  {SHOPIFY_REQUIRED_SCOPES.map((scope) => (
                    <li key={scope.handle}>
                      <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/50">{scope.handle}</code>{' '}
                      — {scope.description}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs">
                Dev Dashboard → your app → Access scopes → enable scopes → release new version →
                install/approve on this store. Then restart <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">npm run dev</code>.
              </p>
            </div>
          ) : menuOptions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No menus found. Create one in Shopify Admin → Online Store → Navigation.
            </p>
          ) : (
            <select
              id="header-shopify-menu"
              value={selectedMenuId}
              onChange={(e) => selectMenu(e.target.value)}
              className={inputClass}
            >
              {menuOptions.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.title} ({menu.handle})
                </option>
              ))}
            </select>
          )}
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Menu titles">
        <div className="space-y-4 pb-2">
          <ColorField
            id="header-nav-link-color"
            label="Title color"
            value={headerNavDraft.linkColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkColor}
            onChange={(linkColor) => updateHeaderNavDraft({ linkColor })}
          />
          <ColorField
            id="header-nav-link-hover-color"
            label="Title hover color"
            value={headerNavDraft.linkHoverColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkHoverColor}
            onChange={(linkHoverColor) => updateHeaderNavDraft({ linkHoverColor })}
          />
          <ColorField
            id="header-nav-link-active-color"
            label="Active title color"
            value={headerNavDraft.linkActiveColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkActiveColor}
            onChange={(linkActiveColor) => updateHeaderNavDraft({ linkActiveColor })}
          />
          <ColorField
            id="header-nav-link-active-underline-color"
            label="Active underline color"
            value={headerNavDraft.linkActiveUnderlineColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.linkActiveUnderlineColor}
            onChange={(linkActiveUnderlineColor) =>
              updateHeaderNavDraft({ linkActiveUnderlineColor })
            }
          />
          <ColorField
            id="header-nav-border-color"
            label="Menu bar border color"
            value={headerNavDraft.navBorderColor}
            fallback={DEFAULT_HEADER_NAV_SETTINGS.navBorderColor}
            onChange={(navBorderColor) => updateHeaderNavDraft({ navBorderColor })}
          />
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Menu item highlights" defaultOpen>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Style a single menu title differently — custom color, underline, and badge (e.g. Sale).
        </p>
        <div className="space-y-3 pb-2">
          {headerNavDraft.menuHighlights.map((block, index) => (
            <HeaderMenuHighlightBlock
              key={block.id}
              block={block}
              index={index}
              onChange={(patch) => updateMenuHighlight(block.id, patch)}
              onRemove={() => removeMenuHighlight(block.id)}
            />
          ))}
          <button
            type="button"
            onClick={addMenuHighlight}
            className="w-full rounded-md border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
          >
            + Add menu item block
          </button>
        </div>
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Logo">
        <ImageUploadField
          id="header-logo-upload"
          label="Logo"
          imageUrl={logoFaviconDraft.logoUrl}
          fileName={logoFaviconDraft.logoFileName}
          uploading={logoFaviconUploading === 'logo'}
          onUpload={(file) => uploadLogoFaviconImage('logo', file)}
        />
        <ImageUploadField
          id="header-logo-transparent-upload"
          label="Logo on transparent header"
          imageUrl={logoFaviconDraft.logoTransparentUrl}
          fileName={logoFaviconDraft.logoTransparentFileName}
          dashed
          emptyLabel="Select"
          uploading={logoFaviconUploading === 'logo-transparent'}
          onUpload={(file) => uploadLogoFaviconImage('logo-transparent', file)}
        />
      </SettingsCollapsibleSection>

      <SettingsCollapsibleSection title="Logo width">
        <LogoWidthRow
          label="Desktop"
          value={logoFaviconDraft.logoWidthDesktop}
          onChange={(logoWidthDesktop) => updateLogoFaviconDraft({ logoWidthDesktop })}
        />
        <LogoWidthRow
          label="Mobile"
          value={logoFaviconDraft.logoWidthMobile}
          onChange={(logoWidthMobile) => updateLogoFaviconDraft({ logoWidthMobile })}
        />
      </SettingsCollapsibleSection>
    </AdminPanelShell>
  )
}
