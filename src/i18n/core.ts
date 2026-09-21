// Språk: svenska är källtext och nyckel. Saknas en översättning används svenskan.
export type Lang = 'sv' | 'no' | 'en'
export const LANGS: [Lang, string][] = [
  ['sv', 'Svenska'],
  ['no', 'Norsk'],
  ['en', 'English'],
]

const KEY = 'haugaards-training:lang'
const LOCALE: Record<Lang, string> = { sv: 'sv-SE', no: 'nb-NO', en: 'en-GB' }

const detect = (): Lang => {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'sv' || saved === 'no' || saved === 'en') return saved
    const nav = (navigator.language || 'sv').toLowerCase()
    if (nav.startsWith('nb') || nav.startsWith('nn') || nav.startsWith('no')) return 'no'
    if (nav.startsWith('en')) return 'en'
  } catch {
    /* ignorera */
  }
  return 'sv'
}

// Standardspråk för vissa konton, används om man inte själv valt språk
export const DEFAULT_LANG_BY_EMAIL: Record<string, Lang> = { 'ohaug01@gmail.com': 'no' }

// Konton som får en välkomstskärm första gången de loggar in
export const WELCOME_NAME_BY_EMAIL: Record<string, string> = { 'ohaug01@gmail.com': 'Oivind' }
export const hasSavedLang = () => {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

let current: Lang = detect()
const dicts: Record<Exclude<Lang, 'sv'>, Map<string, string>> = { no: new Map(), en: new Map() }

export const addTranslations = (rows: [string, string, string][]) => {
  for (const [sv, no, en] of rows) {
    dicts.no.set(sv, no)
    dicts.en.set(sv, en)
  }
}

export const getLang = () => current
export const setCurrentLang = (l: Lang) => {
  current = l
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* ignorera */
  }
  document.documentElement.lang = l === 'no' ? 'nb' : l
}
export const locale = () => LOCALE[current]

// Översätt en svensk text. {namn} ersätts med värden.
export const tr = (sv: string, vars?: Record<string, string | number>) => {
  let s = current === 'sv' ? sv : (dicts[current].get(sv) ?? sv)
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]))
  return s
}
