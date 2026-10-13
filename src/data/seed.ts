import type { Applicant, CaseRow, Flag, HelpId, Listing, ListingDraft, Message, Residence, TaskEntry, CheckinStatus, Stage } from './types'

export const HELP_IDS: HelpId[] = ['groceries', 'garden', 'cooking', 'company', 'walks', 'parcels']
export const HELP_DEFAULT_HOURS: Record<HelpId, number> = { groceries: 2, garden: 1, cooking: 2, company: 2, walks: 1, parcels: 1 }
export const STORY_HELPS: Partial<Record<HelpId, number>> = { groceries: 2, garden: 1, cooking: 2 }

export const AREAS = [
  { id: 'nerima', en: 'Nerima', ja: '練馬区' },
  { id: 'setagaya', en: 'Setagaya', ja: '世田谷区' },
  { id: 'suginami', en: 'Suginami', ja: '杉並区' },
  { id: 'itabashi', en: 'Itabashi', ja: '板橋区' },
  { id: 'nakano', en: 'Nakano', ja: '中野区' },
  { id: 'edogawa', en: 'Edogawa', ja: '江戸川区' },
]

export const LISTINGS: Listing[] = [
  {
    id: 'l1', hostName: { en: 'Mrs Sato', ja: '佐藤さん' }, hostAge: 81, area: AREAS[0], areaId: 'nerima',
    station: { en: '9 min walk from Nerima-Takanodai', ja: '練馬高野台駅から徒歩9分' },
    standardRent: 60000, homeshareRent: 35000, tier: 'standard', helps: {}, languages: ['ja', 'en'], gender: 'any', pets: false, hue: 262, sizeJo: 6,
    bio: {
      en: 'I have lived in this house for 50 years. The room is bright and quiet, and the garden is lovely in spring. I would enjoy company at Sunday dinner.',
      ja: '50年この家に住んでいます。明るく静かなお部屋で、春の庭はとてもきれいです。日曜日の夕食をご一緒できたら嬉しいです。',
    },
  },
  {
    id: 'l2', hostName: { en: 'Mr Tanaka', ja: '田中さん' }, hostAge: 78, area: AREAS[1], areaId: 'setagaya',
    station: { en: '12 min walk from Chitose-Karasuyama', ja: '千歳烏山駅から徒歩12分' },
    standardRent: 72000, homeshareRent: 45000, tier: 'standard', helps: { groceries: 2, garden: 2, parcels: 1 }, languages: ['ja', 'en'], gender: 'any', pets: true, hue: 172, sizeJo: 8,
    bio: {
      en: 'Retired teacher. I have an old cat called Mugi. I like quiet evenings and a little help with the garden.',
      ja: '元教員です。老猫のムギと暮らしています。静かな夜と、庭の手入れを少し手伝ってもらえると助かります。',
    },
  },
  {
    id: 'l3', hostName: { en: 'Mrs Yamamoto', ja: '山本さん' }, hostAge: 84, area: AREAS[2], areaId: 'suginami',
    station: { en: '7 min walk from Asagaya', ja: '阿佐ヶ谷駅から徒歩7分' },
    standardRent: 58000, homeshareRent: 30000, tier: 'standard', helps: { groceries: 3, cooking: 2, company: 3 }, languages: ['ja'], gender: 'women', pets: false, hue: 330, sizeJo: 6,
    bio: {
      en: 'I would like a young woman as a housemate. I love cooking together and talking over tea.',
      ja: '若い女性の方と暮らしたいです。一緒に料理をして、お茶を飲みながらお話しするのが好きです。',
    },
  },
  {
    id: 'l4', hostName: { en: 'Mr Ito', ja: '伊藤さん' }, hostAge: 76, area: AREAS[3], areaId: 'itabashi',
    station: { en: '10 min walk from Narimasu', ja: '成増駅から徒歩10分' },
    standardRent: 52000, homeshareRent: 32000, tier: 'companionship', helps: { company: 3 }, languages: ['ja', 'en', 'vi'], gender: 'any', pets: false, hue: 28, sizeJo: 6,
    bio: {
      en: 'Companionship only. No tasks. I just enjoy having someone to share dinner and a chat with.',
      ja: '話し相手だけをお願いしたいです。作業はありません。一緒に夕食をとり、おしゃべりできれば十分です。',
    },
  },
  {
    id: 'l5', hostName: { en: 'Mrs Kobayashi', ja: '小林さん' }, hostAge: 79, area: AREAS[4], areaId: 'nakano',
    station: { en: '6 min walk from Nakano-Shimbashi', ja: '中野新橋駅から徒歩6分' },
    standardRent: 65000, homeshareRent: 40000, tier: 'standard', helps: { walks: 2, parcels: 1, groceries: 1 }, languages: ['ja', 'en'], gender: 'any', pets: true, hue: 205, sizeJo: 7,
    bio: {
      en: 'I enjoy a slow walk by the river in the morning. A friendly face for the walk would make my day.',
      ja: '朝、川沿いをゆっくり散歩するのが日課です。一緒に歩いてくれる方がいると嬉しいです。',
    },
  },
  {
    id: 'l6', hostName: { en: 'The Watanabes', ja: '渡辺ご夫妻' }, hostAge: 80, area: AREAS[5], areaId: 'edogawa',
    station: { en: '11 min walk from Funabori', ja: '船堀駅から徒歩11分' },
    standardRent: 55000, homeshareRent: 33000, tier: 'companionship', helps: { company: 2 }, languages: ['ja'], gender: 'any', pets: false, hue: 140, sizeJo: 6,
    bio: {
      en: 'A calm couple who would love a cheerful housemate for evening tea. No tasks.',
      ja: '穏やかな夫婦です。夕方のお茶をご一緒してくれる明るい方を探しています。作業はありません。',
    },
  },
]

export const APPLICANTS: Applicant[] = [
  {
    id: 'a1', name: 'Aisyah', age: 22, country: { en: 'Malaysia', ja: 'マレーシア' },
    languages: { en: 'Malay, English, some Japanese (N4)', ja: 'マレー語、英語、日本語(N4)' },
    occupation: { en: "Master's student, Nerima", ja: '大学院生(練馬区)' }, verified: true, residence: 'student',
    skills: [{ en: 'Cooking', ja: '料理' }, { en: 'Gardening', ja: 'ガーデニング' }, { en: 'Patient listener', ja: '聞き上手' }],
    availability: { en: 'Evenings and weekends', ja: '平日の夕方・週末' },
    reasons: [{ en: 'Lives near the station', ja: '駅の近くで通学' }, { en: 'Free on Sunday evenings', ja: '日曜の夕方が空いている' }, { en: 'Loves gardening', ja: '園芸が好き' }],
    hue: 172, status: 'new',
    intro: {
      en: 'Hello Mrs Sato. I am Aisyah, a master\'s student. I enjoy cooking and gardening. I would love to share Sunday dinner with you.',
      ja: '佐藤さん、こんにちは。大学院生のアイシャです。料理と園芸が好きです。日曜日の夕食をご一緒したいです。',
    },
  },
  {
    id: 'a2', name: 'Linh', age: 26, country: { en: 'Vietnam', ja: 'ベトナム' },
    languages: { en: 'Vietnamese, English, Japanese (N3)', ja: 'ベトナム語、英語、日本語(N3)' },
    occupation: { en: 'Nurse at a local clinic', ja: '地域クリニックの看護師' }, verified: true, residence: 'resident',
    skills: [{ en: 'Calm at home', ja: '落ち着いた性格' }, { en: 'Shopping', ja: '買い物' }, { en: 'Light repairs', ja: '簡単な修理' }],
    availability: { en: 'Weekday mornings off', ja: '平日の午前が休み' },
    reasons: [{ en: 'Speaks Japanese (N3)', ja: '日本語N3' }, { en: 'Can do daytime errands', ja: '日中の用事に対応可' }],
    hue: 205, status: 'new',
    intro: {
      en: 'Hello. I do shift duty at the clinic, so I am often home in the morning. I can do shopping and small fixes.',
      ja: 'こんにちは。シフト勤務なので、午前中は家にいることが多いです。買い物や簡単な修理ができます。',
    },
  },
  {
    id: 'a3', name: 'Maria', age: 31, country: { en: 'Philippines', ja: 'フィリピン' },
    languages: { en: 'Tagalog, English, Japanese (N3)', ja: 'タガログ語、英語、日本語(N3)' },
    occupation: { en: 'Care worker at a day-service centre', ja: 'デイサービスの介護職員' }, verified: true, residence: 'resident',
    skills: [{ en: 'Cooking', ja: '料理' }, { en: 'Good company', ja: '話し相手' }, { en: 'Walking together', ja: '散歩の付き添い' }],
    availability: { en: 'Evenings, Sundays', ja: '夕方、日曜日' },
    reasons: [{ en: 'Cooks Sunday dinner', ja: '日曜の夕食を作れる' }, { en: 'Enjoys walks', ja: '散歩が好き' }],
    hue: 330, status: 'new',
    intro: {
      en: 'Good evening. I like cooking for others and taking slow walks. I will not provide care at home, only friendship.',
      ja: 'こんばんは。誰かのために料理をするのと、ゆっくり歩くのが好きです。家ではケアはせず、友人として過ごします。',
    },
  },
  {
    id: 'a4', name: 'Kenji', age: 24, country: { en: 'Japan', ja: '日本' },
    languages: { en: 'Japanese, English', ja: '日本語、英語' },
    occupation: { en: 'Junior designer', ja: '若手デザイナー' }, verified: true, residence: 'resident',
    skills: [{ en: 'Small repairs', ja: '簡単な修理' }, { en: 'Garden', ja: '庭仕事' }, { en: 'Parcels', ja: '荷物の受け渡し' }],
    availability: { en: 'Weekends', ja: '週末' },
    reasons: [{ en: 'Fixes things around the house', ja: '家の修理が得意' }, { en: 'Native Japanese', ja: '日本語ネイティブ' }],
    hue: 28, status: 'new',
    intro: {
      en: 'Hi, I am Kenji. I can help with small repairs and the garden on weekends.',
      ja: 'こんにちは、ケンジです。週末に簡単な修理や庭の手入れをお手伝いできます。',
    },
  },
  {
    id: 'a5', name: 'Priya', age: 27, country: { en: 'India', ja: 'インド' },
    languages: { en: 'English, Hindi, Japanese (N5)', ja: '英語、ヒンディー語、日本語(N5)' },
    occupation: { en: 'Software engineer', ja: 'ソフトウェアエンジニア' }, verified: false, residence: 'resident',
    skills: [{ en: 'Phone and tablet help', ja: 'スマホ・タブレットの相談' }, { en: 'Shopping', ja: '買い物' }],
    availability: { en: 'Evenings', ja: '夕方' },
    reasons: [{ en: 'Can help with phone questions', ja: 'スマホの相談に乗れる' }],
    hue: 48, status: 'new',
    intro: {
      en: 'Hello. I am new to Tokyo and learning Japanese. I would like a quiet home.',
      ja: 'こんにちは。東京に来たばかりで日本語を勉強中です。静かな家を探しています。',
    },
  },
]

const msg = (id: string, from: 'host' | 'tenant', ja: string, en: string, when: string): Message => ({ id, from, ja, en, origLang: from === 'host' ? 'ja' : 'en', when })

export const SEED_MESSAGES: Record<string, Message[]> = {
  a1: [
    msg('m1', 'tenant', APPLICANTS[0].intro.ja, APPLICANTS[0].intro.en, 'Mon 10:12'),
    msg('m2', 'host', 'アイシャさん、ご連絡ありがとう。日曜日の夕食、楽しみです。', 'Thank you for writing, Aisyah. I look forward to Sunday dinner.', 'Mon 10:40'),
    msg('m3', 'tenant', 'ありがとうございます。得意料理はナシレマです。', 'Thank you. My best dish is nasi lemak.', 'Mon 11:02'),
    msg('m4', 'host', '初めて聞くお料理ね。今度の土曜日、お会いできますか？', "I have never heard of that dish. Can we meet this Saturday?", 'Mon 11:15'),
    msg('m5', 'tenant', 'はい、土曜日の午後なら大丈夫です。', 'Yes, Saturday afternoon is fine for me.', 'Mon 11:20'),
  ],
  a2: [msg('n1', 'tenant', APPLICANTS[1].intro.ja, APPLICANTS[1].intro.en, 'Tue 09:05')],
}

export const SEED_TASKS: TaskEntry[] = [
  { id: 't1', help: 'groceries', hours: 2, day: { en: 'Mon', ja: '月' }, status: 'confirmed' },
  { id: 't2', help: 'garden', hours: 1, day: { en: 'Wed', ja: '水' }, status: 'confirmed' },
]

export const SEED_CHECKINS: { week: number; status: CheckinStatus; note?: string }[] = [
  { week: 1, status: 'good' },
  { week: 2, status: 'good' },
  { week: 3, status: 'pending' },
]

export const SEED_CASES: CaseRow[] = [
  { id: 'c1', household: { en: 'Sato household, Nerima', ja: '佐藤さん宅(練馬区)' }, tenant: 'Aisyah', area: AREAS[0], status: 'healthy', week: 3, avgHours: 5, checkins: ['good', 'good', 'pending'], notes: '' },
  { id: 'c2', household: { en: 'Tanaka household, Setagaya', ja: '田中さん宅(世田谷区)' }, tenant: 'Linh', area: AREAS[1], status: 'alert', week: 6, avgHours: 6, checkins: ['good', 'good', 'good', 'good', 'missed', 'missed'], notes: 'Called twice, no answer. Neighbour contact: ask Tanaka-san\'s daughter (consented).' },
  { id: 'c3', household: { en: 'Yamamoto household, Suginami', ja: '山本さん宅(杉並区)' }, tenant: 'Maria', area: AREAS[2], status: 'trial', week: 2, avgHours: 7, checkins: ['good', 'good'], notes: '' },
  { id: 'c4', household: { en: 'Ito household, Itabashi', ja: '伊藤さん宅(板橋区)' }, tenant: 'Kenji', area: AREAS[3], status: 'attention', week: 8, avgHours: 2, checkins: ['good', 'good', 'notgood', 'good', 'good', 'good', 'good', 'missed'], notes: 'Companionship only. One missed week, follow up gently.' },
  { id: 'c5', household: { en: 'Kobayashi household, Nakano', ja: '小林さん宅(中野区)' }, tenant: 'Priya', area: AREAS[4], status: 'healthy', week: 12, avgHours: 4, checkins: ['good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good', 'good'], notes: '' },
]

export const SEED_FLAGS: Flag[] = []

export const SEED_DRAFT: ListingDraft = {
  photos: ['room', 'window', 'kitchen'],
  areaId: 'nerima', sizeJo: 6, bathroom: 'shared', furnished: true,
  standardRent: 60000, homeshareRent: 35000,
  smoking: 'no', pets: false, quiet: '21:00-07:00', guests: 'ask', gender: 'any',
}

export interface TenantProfile {
  name: string
  languages: string[]
  residence: Residence
  verifyStep: number // 0 profile, 1 residence, 2 id, 3 references, 4 done
  idDone: boolean
  refs: string[]
  otherHours: number
}

export const SEED_TENANT: TenantProfile = {
  name: 'Aisyah', languages: ['ms', 'en', 'ja'], residence: 'student', verifyStep: 4, idDone: true,
  refs: ['University advisor (fictional)', 'Former landlady (fictional)'], otherHours: 14,
}

export const SEED_STAGE: Stage = 'meet'

export const BANNED = ['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const
