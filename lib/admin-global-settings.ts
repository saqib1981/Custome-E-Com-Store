import { Image, Palette } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Keys under Supabase `store_settings` for site-wide theme options. */
export type AdminGlobalSettingId = 'general' | 'logo-favicon'

export type AdminGlobalSettingItem = {
  id: AdminGlobalSettingId
  name: string
  description: string
  icon: LucideIcon
}

export const GLOBAL_SETTINGS_ITEMS: AdminGlobalSettingItem[] = [
  {
    id: 'general',
    name: 'General settings',
    description: 'Theme background color',
    icon: Palette,
  },
  {
    id: 'logo-favicon',
    name: 'Logo and favicon',
    description: 'Logo, favicon, and logo width',
    icon: Image,
  },
]
