# Tomoni Homeshare (concept web app)

> A spare room for a helping hand, safely matched.

A responsive React web app for the Tokyo Global Innovation Challenge 2026 pitch.
Older homeowners rent a spare room at a lower rent; housemates give light, voluntary, capped help. The host always decides, and Tomoni handles verification, the agreement, check-ins and safety.

There is no backend. Data is seeded, fictional, and stored in the browser (localStorage), so a person can try every role on one device.
**Concept prototype. Legal review is required before any real pilot.**

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve dist/ on http://localhost:4173
npm run check:i18n   # every key exists in both English and Japanese
npm run format       # Prettier
```

Deploy to Vercel as a static Vite site. `vercel.json` rewrites every route to `index.html`.

## Three ways to use it

Open the menu (top right) to switch between them. Each is a real session over the same data.

| View | Start at | What you can do |
|------|----------|-----------------|
| Host (Mrs Sato) | `/host` | Edit the listing, set rent and help hours (10 h cap), review applicants ranked by match score (open a profile to message, plan a meet-up or reject), start a trial, sign, confirm help, answer the weekly check-in |
| Housemate (Aisyah) | `/aisha/explore` | Search and filter rooms, save (the **Saved** button on Explore shows saved rooms), apply, message hosts, confirm meet-ups, sign, log help in the **Task log** (with the 28 h student tracker), monthly pulse, report a concern |
| Family (Emi) | `/family` | Opt in, then see the weekly check-in, confirmed hours and meet-ups. Never messages |

All of Aisyah's pages live under `/aisha/...` (old housemate URLs redirect there). The coordinator desk is at `/coordinator` and the Safety Centre at `/safety`.

### A natural walk-through

1. Host: **Applicants →** open Aisyah's profile **→ Message** (the guardrails react if you write about bathing, money or secrets).
   Language is a dropdown in the header. Chat leads in the chosen language, with the other language beneath.
2. **Plan a meet-up**: pick a time, check or change it in the confirmation pop-up, and send. A notice appears in both people's chat and Aisyah taps **Confirm this time**. Then **Start the trial stay**, **Continue to the agreement**, sign.
   Stay, Agreement and Check-in are one **Stay** area in the nav, with tabs at the top.
3. Menu → **Finding a room as Aisyah**. Mark any task **I can't do this**, then sign.
   Any change to the tasks clears both signatures, so the host signs the final version again.
4. Open the **Coordinator desk** → **Approve agreement**. You are now living together.
5. Aisyah logs help in **Task log**. Menu → host → **Today → Confirm**.
6. Host **Stay → Check-in tab → All good** (a photo is optional). Menu → **Family view** to see it.
7. **Coordinator desk**: click any case to see why it has its status and what to do next. Resolve flags, move a case up the escalation steps and log coordinator time.

Prefer to skip ahead? Menu → **Load sample: week 3 of living together**. Menu → **Start over with fresh sample data** resets everything.

## Folder structure

```
src/
  tokens.ts           design tokens and product rules (cap, membership, text sizes)
  store.ts            Zustand store, persisted to localStorage
  data/               types, seeded data, matching score, pricing maths, journey stages
  lib/                guardrails + mock translation, formatting, hooks
  i18n/               en.ts and ja.ts (ja is type-checked against en)
  components/
    ui/               Button, Chip, Modal, Field, Stepper, Avatar, Photo
    domain/           ListingCard, MapView, HourMeter, StepBar, ChatBubble, StayTabs, Bits
    layout/           Header, LangSelect, TabBar, Footer, AppShell, Wizard, Wordmark
  screens/
    host/             Today, People, CreateListing, HelpPicker, CheckIn
    tenant/           Explore (with the saved view), ListingDetail, Log, Account, Verify, Pulse
    family/           Family (invite + dashboard)
    Landing, Messages, Stay, Agreement, Safety, Coordinator
scripts/check-i18n.mjs
```

## Behaviour worth knowing

- **Search state lives in the URL** (`/aisha/explore?where=nakano&cat=pets&sort=cost`), so results are shareable and survive refresh.
- **Hour cap**: nothing can take weekly help above 10 hours, in the help picker, the agreement, or the task log.
- **Agreement consent**: the agreement keeps its own copy of the tasks. The housemate can decline any task, any change clears both signatures, and a coordinator approves the signed agreement before the stay starts.
- **Student limit**: for students, logging is blocked if help plus other work would pass 28 hours a week.
- **Guardrails** (English and Japanese): personal care and medical requests show an inline care-manager card. Money, lending or borrowing, cards, PINs, passwords, inkan, contracts, wills, large gifts and secrecy ("don't tell anyone") show a warning to both sides and flag the coordinator. Romantic pressure gets a boundary reminder and a flag too. Try "Could you lend me 50,000 yen?" in a chat.
- **Rent is not payment for help**: the agreement and the listing editor say the rent is fixed in the lease and help is voluntary.
- **ID consent**: the ID check explains what is kept (result, residence status and expiry) and what is deleted (card and selfie images), and starts only after consent.
- **Work permission**: students confirm permission to engage in activity outside their status (資格外活動許可). Without it, like visas that limit activity, they see companionship-only rooms.
- **Check-ins**: two missed in a row raise an alert on the coordinator desk.
- **Escalation ladder** (6 steps): nudge, coordinator call, written warning, mediated meeting, pre-agreed end, removal from Tomoni. "Switch to standard rent" is left out until a labour lawyer has reviewed it.
- **Family summary**: "This week in brief" on the family view is a template built only from check-ins, confirmed hours and plans. It never uses message content.
- **Text size** (A / A+ / A++) is in the header for hosts and family.
- **Japanese and English** cover every string. Messages are shown in the viewer's language with the original beneath and an "AI-assisted" label.

See [DESIGN_NOTES.md](DESIGN_NOTES.md) for the design references, the formulas behind every number, and known limits.
