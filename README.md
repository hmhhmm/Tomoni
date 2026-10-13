# Tomoni Homeshare (concept prototype)

> A spare room for a helping hand, safely matched.

A clickable React prototype for the Tokyo Global Innovation Challenge 2026 pitch.
It is a front-end only demo with seeded, fictional data. **Concept prototype. Legal review is required before any real pilot.**

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Add `?demo=1` to open the Demo script panel, or use the "Demo script" button.

```bash
npm run build        # type-check + production build into dist/
npm run preview      # serve dist/ on http://localhost:4173
npm run check:i18n   # every key exists in both EN and JA
```

### Deploy to Vercel

It is a static Vite site. Import the repo in Vercel (framework preset: Vite). `vercel.json` rewrites all routes to `index.html` so deep links such as `/chat` work.

## The 90-second demo story

Open the Demo script panel and press **Go** on each step. Every step restores the state it needs, so you can jump in anywhere.

| Step | What to do | What you see |
|------|------------|--------------|
| 1. Mrs Sato lists her room | Tap shopping, garden, Sunday dinner (or "Fill it for me") | Hour meter at 5 / 10. Past 10 is blocked kindly |
| 2. Aisyah applies | Use the "Mrs Sato / Aisyah" switch at the top of the chat | JA on one side, EN on the other, with an "AI-assisted" label |
| 3. Guardrail | Press "Send" on the prefilled "Can you help me bathe?" | Inline care card with "Contact care manager" |
| 4. Pact | Sign as Mrs Sato, switch to Aisyah, sign | "You are living together" |
| 5. Week 3 | Tap 👍 All good, then "Family dashboard" | Her daughter sees "All good" |

Other guardrails:

- **Money, bank, card, PIN, inkan, "don't tell anyone"**: send the "Try: mention a bank card" phrase. Both sides see a warning, and the message appears on the coordinator desk.
- **Two missed check-ins**: the coordinator desk (`/coordinator`) already shows one. Press "Simulate a missed check-in" on any case to create another.
- **Hour cap**: add more than 10 hours in the help picker or the Pact.

## Screen recording

`demo/tomoni-demo-1080p.mp4` is a 1080p, ~57s recording of the five-step story, captured by a scripted browser run against the production build.

## Reset demo data

Press **Reset demo** in the Demo script panel. It restores all seeded data and keeps your language and role.
To wipe everything by hand, clear `tomoni-prototype-v1` from localStorage.

## Screens and routes

| Route | Screen |
|-------|--------|
| `/` | 0. Welcome / role choice |
| `/host/home` | Host home (journey + next step) |
| `/host/create` | 1. Create listing (3 steps) |
| `/host/help` | 2. Help picker + hour meter |
| `/host/applicants` | 3. Applicants |
| `/chat` | 4 and 11. Chat with AI translation (host and tenant) |
| `/trial` | 5. Meet-up and trial stay |
| `/pact` | 6. Living Together Pact |
| `/host/checkin` | 7. Weekly check-in |
| `/tenant/onboarding` | 8. Onboarding and verification |
| `/tenant/browse` | 9. Browse listings |
| `/tenant/listing/:id` | 10. Listing detail |
| `/tenant/tasks` | 12. Task log and trackers |
| `/tenant/pulse` | 13. Monthly pulse and report a concern |
| `/tenant/me` | Tenant profile hub |
| `/family/invite`, `/family/dashboard` | 14. Family consent and dashboard |
| `/safety` | Safety Centre |
| `/coordinator` | Coordinator concept view (desktop) |

## Folder structure

```
src/
  tokens.ts            design tokens: colours, radius, shadow, fonts, product rules
  store.ts             Zustand store, persisted to localStorage, plus resetDemo()
  ui.ts                transient UI state (toast, demo panel)
  data/                types and seeded fictional data
  lib/                 guardrails + mock translation, hooks, help icons
  i18n/                en.ts and ja.ts (ja is type-checked against en)
  components/          Card, Chip, Button, HourMeter, StepBar, ChatBubble,
                       SafetyShield, Stepper, Avatar, RoomArt, AppShell, DemoPanel
  screens/             one file per screen (host/, tenant/, family/)
scripts/check-i18n.mjs verifies translation coverage
```

## Notes

- Light mode only. Poppins, DM Sans and Noto Sans JP load from Google Fonts, with system fallbacks.
- No real photos: avatars and rooms are generated SVG illustrations.
- Translation is mocked from pre-written JA/EN pairs. Guardrails are keyword rules.
- Prices (rent examples, ¥8,000 membership) are examples only. Hosts are free.
- See [DESIGN_NOTES.md](DESIGN_NOTES.md) for references and the contrast table.
