'use client'

import GeneralSettingsPanel from '@/components/admin/GeneralSettingsPanel'
import LogoFaviconSettingsPanel from '@/components/admin/LogoFaviconSettingsPanel'
import type { AdminGlobalSettingId } from '@/lib/admin-global-settings'

type GlobalSettingPanelProps = {
  settingId: AdminGlobalSettingId
}

export default function GlobalSettingPanel({ settingId }: GlobalSettingPanelProps) {
  if (settingId === 'general') {
    return <GeneralSettingsPanel />
  }

  if (settingId === 'logo-favicon') {
    return <LogoFaviconSettingsPanel />
  }

  return null
}
