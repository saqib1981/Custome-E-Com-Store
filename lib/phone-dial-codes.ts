/** ISO country code → international dialing prefix (E.164 style, with +). */
export const COUNTRY_DIAL_CODES: Record<string, string> = {
  AF: '+93',
  AL: '+355',
  DZ: '+213',
  AD: '+376',
  AO: '+244',
  AR: '+54',
  AM: '+374',
  AU: '+61',
  AT: '+43',
  AZ: '+994',
  BH: '+973',
  BD: '+880',
  BY: '+375',
  BE: '+32',
  BZ: '+501',
  BJ: '+229',
  BT: '+975',
  BO: '+591',
  BA: '+387',
  BR: '+55',
  BN: '+673',
  BG: '+359',
  KH: '+855',
  CM: '+237',
  CA: '+1',
  CL: '+56',
  CN: '+86',
  CO: '+57',
  CR: '+506',
  HR: '+385',
  CY: '+357',
  CZ: '+420',
  DK: '+45',
  DO: '+1',
  EC: '+593',
  EG: '+20',
  SV: '+503',
  EE: '+372',
  ET: '+251',
  FI: '+358',
  FR: '+33',
  GE: '+995',
  DE: '+49',
  GH: '+233',
  GR: '+30',
  GT: '+502',
  HN: '+504',
  HK: '+852',
  HU: '+36',
  IS: '+354',
  IN: '+91',
  ID: '+62',
  IQ: '+964',
  IE: '+353',
  IL: '+972',
  IT: '+39',
  JM: '+1',
  JP: '+81',
  JO: '+962',
  KZ: '+7',
  KE: '+254',
  KW: '+965',
  KG: '+996',
  LV: '+371',
  LB: '+961',
  LY: '+218',
  LI: '+423',
  LT: '+370',
  LU: '+352',
  MO: '+853',
  MY: '+60',
  MV: '+960',
  MT: '+356',
  MX: '+52',
  MD: '+373',
  MC: '+377',
  MN: '+976',
  ME: '+382',
  MA: '+212',
  MZ: '+258',
  MM: '+95',
  NP: '+977',
  NL: '+31',
  NZ: '+64',
  NI: '+505',
  NG: '+234',
  MK: '+389',
  NO: '+47',
  OM: '+968',
  PK: '+92',
  PA: '+507',
  PY: '+595',
  PE: '+51',
  PH: '+63',
  PL: '+48',
  PT: '+351',
  QA: '+974',
  RO: '+40',
  RU: '+7',
  SA: '+966',
  SN: '+221',
  RS: '+381',
  SG: '+65',
  SK: '+421',
  SI: '+386',
  ZA: '+27',
  KR: '+82',
  ES: '+34',
  LK: '+94',
  SE: '+46',
  CH: '+41',
  TW: '+886',
  TJ: '+992',
  TZ: '+255',
  TH: '+66',
  TN: '+216',
  TR: '+90',
  TM: '+993',
  UG: '+256',
  UA: '+380',
  AE: '+971',
  GB: '+44',
  US: '+1',
  UY: '+598',
  UZ: '+998',
  VE: '+58',
  VN: '+84',
  YE: '+967',
  ZM: '+260',
  ZW: '+263',
}

export function dialCodeForCountry(countryCode: string): string {
  const key = countryCode.trim().toUpperCase()
  return COUNTRY_DIAL_CODES[key] || '+92'
}

/** True when value looks like a phone (digits), not an email. */
export function looksLikePhoneInput(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  if (v.includes('@')) return false
  if (/[a-zA-Z]/.test(v)) return false
  return /^[\d\s+\-().]+$/.test(v) && /\d/.test(v)
}

export function looksLikeEmailInput(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  if (v.includes('@')) return true
  return /[a-zA-Z]/.test(v)
}

/** National number digits only (strip dial code if pasted). */
export function normalizeNationalPhone(raw: string, dialCode: string): string {
  let digits = raw.replace(/\D/g, '')
  const dialDigits = dialCode.replace(/\D/g, '')
  if (dialDigits && digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length)
  }
  // Pakistan mobiles often typed with leading 0
  if (dialCode === '+92' && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return digits
}

export function formatE164(dialCode: string, national: string): string {
  const n = national.replace(/\D/g, '')
  if (!n) return ''
  return `${dialCode}${n}`
}

/** National significant number length by ISO country (without country calling code). */
export type PhoneLengthRule = {
  min: number
  max: number
  /** Optional local pattern hint shown under the field */
  example?: string
}

export const NATIONAL_PHONE_LENGTH: Record<string, PhoneLengthRule> = {
  PK: { min: 10, max: 10, example: '3XXXXXXXXX' },
  IN: { min: 10, max: 10, example: '9XXXXXXXXX' },
  BD: { min: 10, max: 10, example: '1XXXXXXXXX' },
  AE: { min: 9, max: 9, example: '5XXXXXXXX' },
  SA: { min: 9, max: 9, example: '5XXXXXXXX' },
  US: { min: 10, max: 10, example: '2015550123' },
  CA: { min: 10, max: 10, example: '4165550123' },
  GB: { min: 10, max: 10, example: '7400XXXXXX' },
  AU: { min: 9, max: 9, example: '4XXXXXXXX' },
  NZ: { min: 8, max: 10 },
  DE: { min: 10, max: 11 },
  FR: { min: 9, max: 9 },
  IT: { min: 9, max: 10 },
  ES: { min: 9, max: 9 },
  NL: { min: 9, max: 9 },
  BE: { min: 8, max: 9 },
  CH: { min: 9, max: 9 },
  SE: { min: 9, max: 10 },
  NO: { min: 8, max: 8 },
  DK: { min: 8, max: 8 },
  FI: { min: 9, max: 10 },
  IE: { min: 9, max: 9 },
  PT: { min: 9, max: 9 },
  PL: { min: 9, max: 9 },
  TR: { min: 10, max: 10 },
  EG: { min: 10, max: 10 },
  NG: { min: 10, max: 10 },
  ZA: { min: 9, max: 9 },
  KE: { min: 9, max: 9 },
  MY: { min: 9, max: 10 },
  SG: { min: 8, max: 8 },
  ID: { min: 9, max: 12 },
  PH: { min: 10, max: 10 },
  TH: { min: 9, max: 9 },
  VN: { min: 9, max: 10 },
  JP: { min: 10, max: 10 },
  KR: { min: 9, max: 10 },
  CN: { min: 11, max: 11 },
  HK: { min: 8, max: 8 },
  TW: { min: 9, max: 9 },
  QA: { min: 8, max: 8 },
  KW: { min: 8, max: 8 },
  BH: { min: 8, max: 8 },
  OM: { min: 8, max: 8 },
  JO: { min: 9, max: 9 },
  LB: { min: 7, max: 8 },
  IQ: { min: 10, max: 10 },
  AF: { min: 9, max: 9 },
  NP: { min: 10, max: 10 },
  LK: { min: 9, max: 9 },
  BR: { min: 10, max: 11 },
  MX: { min: 10, max: 10 },
  AR: { min: 10, max: 10 },
  RU: { min: 10, max: 10 },
  UA: { min: 9, max: 9 },
}

export function phoneLengthForCountry(countryCode: string): PhoneLengthRule {
  const key = countryCode.trim().toUpperCase()
  return NATIONAL_PHONE_LENGTH[key] || { min: 7, max: 15 }
}

export function countryCodeFromDialCode(
  dialCode: string,
  preferredCountry?: string
): string {
  const dial = dialCode.trim()
  if (preferredCountry && dialCodeForCountry(preferredCountry) === dial) {
    return preferredCountry.trim().toUpperCase()
  }
  const match = Object.entries(COUNTRY_DIAL_CODES).find(([, d]) => d === dial)
  return match?.[0] || preferredCountry?.trim().toUpperCase() || 'PK'
}

/** Validate national digits for a country. Returns error message or null if ok. */
export function validateNationalPhone(
  countryCode: string,
  national: string
): string | null {
  const digits = national.replace(/\D/g, '')
  if (!digits) return 'Enter a phone number'
  const rule = phoneLengthForCountry(countryCode)
  if (digits.length < rule.min || digits.length > rule.max) {
    if (rule.min === rule.max) {
      return `Enter a complete ${rule.min}-digit phone number${
        rule.example ? ` (e.g. ${rule.example})` : ''
      }`
    }
    return `Enter a phone number with ${rule.min}–${rule.max} digits`
  }
  const code = countryCode.trim().toUpperCase()
  if (code === 'PK' && !/^3\d{9}$/.test(digits)) {
    return 'Enter a valid Pakistani mobile (e.g. 3XXXXXXXXX)'
  }
  if (code === 'IN' && !/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid Indian mobile number'
  }
  if ((code === 'US' || code === 'CA') && !/^[2-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit phone number'
  }
  if (code === 'AE' && !/^5\d{8}$/.test(digits)) {
    return 'Enter a valid UAE mobile (e.g. 5XXXXXXXX)'
  }
  if (code === 'SA' && !/^5\d{8}$/.test(digits)) {
    return 'Enter a valid Saudi mobile (e.g. 5XXXXXXXX)'
  }
  return null
}

/** Validate full stored phone (E.164 or raw) for a shipping country. */
export function validateCheckoutPhone(
  countryCode: string,
  phone: string
): string | null {
  const dial = dialCodeForCountry(countryCode)
  const national = normalizeNationalPhone(phone, dial)
  return validateNationalPhone(countryCode, national)
}

