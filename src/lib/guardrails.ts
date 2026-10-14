import type { Lang } from '../data/types'

/** Keyword guardrails: transparent and deliberately simple (EN + JA). A real product needs reviewed models plus human review. */
const CARE =
  /\bbath(e|ing)?\b|\btoilet(ing)?\b|\bfeed(ing)?\s+(me|her|him|them)\b|\bmedic(ine|ation)s?\b|\bpills?\b|\bdiapers?\b|\bchange (my|her|his) clothes\b|(お風呂|風呂|入浴).*(手伝|助|入れ)|トイレ|排泄|おむつ|食べさせ|食事介助|服薬|薬を/i
/** Money, cards, passwords, legal documents, wills, large gifts and secrecy (IDEA.md banned list). */
const MONEY = new RegExp(
  [
    String.raw`\b(money|bank|transfer|card|pin|inkan|hanko|cash|loan|password|passcode|guarantor|testament|inheritance|inherit|deed)\b`,
    String.raw`\b(lend|borrow|loan)\w*\b.{0,25}(money|yen|¥|\d|cash|card)|\blend me\b`,
    // "will" only as a legal document, never the verb ("I will cook").
    String.raw`\b(my|your|her|his|a) will\b|\bpower of attorney\b`,
    String.raw`\b(sign|stamp)\b.{0,15}\b(contract|document|paper|form|agreement)s?\b`,
    String.raw`\b(gift|present)s?\b.{0,30}(\d|¥|yen)|\bgive you my (house|home|car|savings|money|jewel\w*)\b`,
    String.raw`don'?t tell (anyone|anybody|my|your)|keep (it|this) (a )?secret|\bour (little )?secret\b|\bbetween (us|you and me)\b`,
    'お金|銀行|振込|振り込|送金|カード|暗証|印鑑|ハンコ|判子|実印|パスワード|保証人|遺言|相続|契約書|借金',
    '(お金|円|金).{0,6}(貸|借)|貸してくれ|貸してください|貸してもら',
    '(プレゼント|贈り物|あげ).{0,10}(万|円)',
    '内緒|ないしょ|誰にも言わ|秘密に',
  ].join('|'),
  'i',
)
/** Romantic or sexual pressure: homeshare is a housemate arrangement. */
const ROMANCE =
  /\bi love you\b|\bmarry (me|you)\b|\bmarriage\b|\b(be my|my) (girlfriend|boyfriend|wife|husband|lover)\b|\bdate (me|with me)\b|\bgo on a date\b|\bkiss\b|\bsleep (with|together)\b|\bshare (a|my|your) bed\b|愛して|結婚し|付き合って|恋人に|キスし|一緒に寝/i

export type Guardrail = 'care' | 'money' | 'romance' | null

export function detectGuardrail(text: string): Guardrail {
  if (CARE.test(text)) return 'care'
  if (MONEY.test(text)) return 'money'
  if (ROMANCE.test(text)) return 'romance'
  return null
}

/** Pre-written JA/EN pairs. Translation is mocked: these phrases (and the seeded chats) translate; free text is labelled. */
export const PHRASES: { ja: string; en: string }[] = [
  { ja: 'こんにちは！', en: 'Hello!' },
  { ja: 'ありがとうございます。', en: 'Thank you.' },
  { ja: 'はい、大丈夫です。', en: 'Yes, that is fine.' },
  { ja: 'いいえ、難しいです。', en: 'No, that is difficult.' },
  { ja: 'よろしくお願いします。', en: 'Nice to meet you.' },
  { ja: '日曜日の夕食を一緒に作りましょう。', en: "Let's cook Sunday dinner together." },
  { ja: '日曜日の夕食、私が作ります！', en: 'I will cook Sunday dinner!' },
  { ja: '今日の買い物をお願いできますか？', en: 'Could you help with the shopping today?' },
  { ja: '買い物は私が行きます。', en: 'I will do the shopping.' },
  { ja: '今週の土曜日は空いていますか？', en: 'Are you free this Saturday?' },
  { ja: '土曜日の午後なら大丈夫です。', en: 'Saturday afternoon is fine for me.' },
  { ja: '庭の水やりを手伝ってもらえますか？', en: 'Could you help water the garden?' },
  { ja: '庭のお手伝いもできます。', en: 'I can help with the garden too.' },
  { ja: '何時に帰りますか？', en: 'What time will you be home?' },
  { ja: '少し遅れます。', en: 'I will be a little late.' },
  { ja: 'お部屋を見せてもらえますか？', en: 'May I see the room?' },
  { ja: 'お部屋の見学は、いつがよいですか？', en: 'When would be a good time to see the room?' },
  { ja: 'お茶を飲みませんか？', en: 'Would you like some tea?' },
  { ja: '今日は体調はいかがですか？', en: 'How are you feeling today?' },
  { ja: 'おやすみなさい。', en: 'Good night.' },
  { ja: 'お風呂を手伝ってくれますか？', en: 'Can you help me bathe?' },
  { ja: 'お金を振り込んでもらえますか？', en: 'Could you transfer some money for me?' },
  { ja: '5万円貸してもらえますか？', en: 'Could you lend me 50,000 yen?' },
  { ja: '銀行のカードと暗証番号を預かってください。誰にも内緒でお願いします。', en: "Please keep my bank card and PIN. Don't tell anyone." },
]

const norm = (s: string) =>
  s
    .trim()
    .replace(/[!！?？。.、,]+$/g, '')
    .toLowerCase()

export function translate(text: string, from: Lang): { ja: string; en: string; exact: boolean } {
  const hit = PHRASES.find((p) => norm(p[from]) === norm(text))
  if (hit) return { ...hit, exact: true }
  return from === 'ja' ? { ja: text, en: text, exact: false } : { en: text, ja: text, exact: false }
}
