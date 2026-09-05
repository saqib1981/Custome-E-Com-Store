'use client'

import GeneralSettingsPanel from '@/components/admin/GeneralSettingsPanel'
import LogoFaviconSettingsPanel from '@/components/admin/LogoFaviconSettingsPanel'
import FloatingButtonsSettingsPanel from '@/components/admin/FloatingButtonsSettingsPanel'
import BadgesSettingsPanel from '@/components/admin/BadgesSettingsPanel'
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

  if (settingId === 'badges') {
    return <BadgesSettingsPanel />
  }

  if (settingId === 'floating-buttons') {
    return <FloatingButtonsSettingsPanel />
  }

  return null
}
