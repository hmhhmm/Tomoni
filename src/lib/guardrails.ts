import type { Lang } from '../data/types'

/** Keyword guardrails. Deliberately simple and transparent: this is a prototype. */
const CARE =
  /\bbath(e|ing)?\b|\btoilet(ing)?\b|\bfeed(ing)?\s+(me|her|him|them)\b|\bmedic(ine|ation)s?\b|\bpills?\b|\bdiapers?\b|(お風呂|風呂|入浴).*(手伝|助|入れ)|トイレ|排泄|おむつ|食べさせ|食事介助|服薬|薬を/i
const MONEY =
  /\b(money|bank|transfer|card|pin|inkan|hanko|cash|loan)\b|don'?t tell (anyone|anybody)|keep (it|this) (a )?secret|お金|銀行|振込|振り込|送金|カード|暗証|印鑑|ハンコ|判子|内緒|ないしょ|誰にも言わ/i

export type Guardrail = 'care' | 'money' | null

export function detectGuardrail(text: string): Guardrail {
  if (CARE.test(text)) return 'care'
  if (MONEY.test(text)) return 'money'
  return null
}

/** Pre-written JA/EN pairs. AI translation is mocked: only these phrases (and the seeded chat) translate. */
export const PHRASES: { ja: string; en: string }[] = [
  { ja: 'こんにちは！', en: 'Hello!' },
  { ja: 'ありがとうございます。', en: 'Thank you.' },
  { ja: 'はい、大丈夫です。', en: 'Yes, that is fine.' },
  { ja: '日曜日の夕食を一緒に作りましょう。', en: "Let's cook Sunday dinner together." },
  { ja: '今日の買い物をお願いできますか？', en: 'Could you help with the shopping today?' },
  { ja: '今週の土曜日は空いていますか？', en: 'Are you free this Saturday?' },
  { ja: 'お風呂を手伝ってくれますか？', en: 'Can you help me bathe?' },
  { ja: 'お金を振り込んでもらえますか？', en: 'Could you transfer some money for me?' },
  { ja: '銀行のカードと暗証番号を預かってください。誰にも内緒でお願いします。', en: "Please keep my bank card and PIN. Don't tell anyone." },
  { ja: '庭の水やりを手伝ってもらえますか？', en: 'Could you help water the garden?' },
  { ja: '日曜日の夕食、私が作ります！', en: "I will cook Sunday dinner!" },
  { ja: '庭のお手伝いもできます。', en: 'I can help with the garden too.' },
  { ja: '何時に帰りますか？', en: 'What time will you be home?' },
]

const norm = (s: string) => s.trim().replace(/[!！?？。.]+$/g, '').toLowerCase()

export function translate(text: string, from: Lang): { ja: string; en: string } {
  const hit = PHRASES.find((p) => norm(p[from]) === norm(text))
  if (hit) return hit
  const note = from === 'ja' ? '(Demo translation: pre-written phrases only) ' : '(デモ翻訳:定型文のみ対応) '
  return from === 'ja' ? { ja: text, en: note + text } : { en: text, ja: note + text }
}
