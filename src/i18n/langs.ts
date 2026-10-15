import type { Lang, UiLang } from '../data/types'

/** Page languages, in the order shown in the language dropdown (native names). IDEA.md lists all five. */
export const UI_LANGS: { id: UiLang; label: string; html: string; locale: string }[] = [
  { id: 'en', label: 'English', html: 'en', locale: 'en-GB' },
  { id: 'ja', label: '日本語', html: 'ja', locale: 'ja-JP' },
  { id: 'ms', label: 'Bahasa Melayu', html: 'ms', locale: 'ms-MY' },
  { id: 'vi', label: 'Tiếng Việt', html: 'vi', locale: 'vi-VN' },
  { id: 'zh', label: '简体中文', html: 'zh-Hans', locale: 'zh-CN' },
]

export const isUiLang = (v: unknown): v is UiLang => UI_LANGS.some((l) => l.id === v)

const find = (l: UiLang) => UI_LANGS.find((x) => x.id === l) ?? UI_LANGS[0]

/** Locale for dates and numbers. */
export const localeOf = (l: UiLang) => find(l).locale

/** Value for <html lang>, so screen readers and fonts pick the right language. */
export const htmlLangOf = (l: UiLang) => find(l).html

/**
 * Seeded content (listings, applicant intros) and chat translation exist only in English and Japanese
 * in the prototype. Malay, Vietnamese and Chinese readers see the English version of that content.
 */
export const contentLang = (l: UiLang): Lang => (l === 'ja' ? 'ja' : 'en')
