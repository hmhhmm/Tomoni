# Tomoni Homeshare: design notes

Concept prototype for the Tokyo Global Innovation Challenge 2026 (Idea Category).
All people, prices and organisations in the UI are fictional examples.

## Direction

Tomoni is a **web app**, designed in the way people already know from Airbnb: a photo-first marketplace on the guest side, a calm "Today" workspace on the host side. The accent colour is used sparingly, the surfaces are white, and the safety layer is always one tap away.

### Airbnb patterns we borrowed

Airbnb publishes no public design system. The notes below come from community reverse-engineering and from how the product behaves, so treat exact values as approximate.

| Pattern | How it appears in Tomoni |
|---------|--------------------------|
| Pill search bar with segmented fields and a round accent button | Explore: Where / Move in / Monthly cost, with a purple search orb |
| Icon category row under the search | Explore: Light help, Company only, Pets welcome, Near station, English spoken, Under ¥45k, Women only |
| "Filters" modal with a live "Show N rooms" button | Explore filters: price range, arrangement type, help hours, walk time, language, preference, pets |
| Photo-first cards, no shadow, heart top-right, carousel dots | Listing cards: 5-picture carousel, save heart (persisted), status pill |
| List with a map toggle ("Show map") | Explore list or split list + price-pin map |
| Photo mosaic (1 large + 4) with "Show all photos" | Listing detail |
| Two-column detail with a sticky booking card | Listing detail: cost breakdown, your fit, Apply |
| "Things to know": rules, safety, stay | Listing detail footer sections |
| Focused host onboarding with a segmented bottom progress bar | Create listing and help picker wizard |
| Host "Today" tab with overview metrics and a to-do list | Host Today |
| Two-pane inbox with unread badges | Messages |
| Bottom tab bar on phones | Tab bar for every persona |
| Profile menu with "Switch to hosting" | Menu: switch between host, housemate and family views |

Sources used for the pattern list (community write-ups, not Airbnb's own):
[superdesign.dev breakdown](https://superdesign.dev/blog/airbnb-design-system),
[VoltAgent DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/airbnb/DESIGN.md),
[design.withfudge.com](https://design.withfudge.com/share/airbnb.com-design).

### Other references

| Source | What we took |
|--------|--------------|
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) incl. [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) and [Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html) | AA contrast; 44px+ controls; the Safety shield sits in the same header slot on every screen |
| [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Text-size levels, labels on every control, no gesture-only actions |
| [Material 3: Accessible design](https://m3.material.io/foundations/accessible-design/overview) | Clear focus states; colour never the only signal |
| [NN/g: Usability for senior citizens](https://www.nngroup.com/articles/usability-for-senior-citizens/) | Larger type for hosts, plain wording, undo on "Not now" and on ending a trial |
| [Uber Safety](https://www.uber.com/us/en/safety/) | Persistent safety shield, emergency access, opt-in trusted contacts (Family view) |
| [Stripe: accessible colour systems](https://stripe.com/blog/accessible-color-systems) | Few accents with contrast checked, recorded in `src/tokens.ts` |

The links were checked for reachability on 2026-10-13. The patterns are summarised, not quoted. Nothing here was validated with real users.

## Product metrics (all computed from live state)

| Metric | Definition | Where |
|--------|------------|-------|
| Weekly help hours | Sum of hours across selected tasks, hard cap 10 | Help picker, Agreement, Today |
| Monthly help hours | weekly hours × 52 / 12 | Listing detail, Today |
| Discount | (standard rent − homeshare rent) / standard rent | Today, listing editor |
| Monthly all-in cost | homeshare rent + ¥8,000 membership | Cards, filters, detail |
| Net saving | standard rent − all-in cost; yearly = × 12 | Listing detail |
| Suggested rent band | 40% to 65% of standard rent | Listing editor |
| Match score (0–100) | 40 tasks they can do (hour-weighted) + 25 free help times (hour-weighted) + 20 shared language (native/fluent 1.0, conversational 0.85, basic 0.5, none 0.3) + 15 ID verified | Applicants |
| Your fit | Same inputs, from the housemate's profile | Listing detail |
| Student limit | other hours + help hours ≤ 28 per week, warning at 24 | Help log |
| Trial day | days since the trial started, capped at the trial length | Stay, Today |
| Check-in rate | answered / (answered + missed) across all cases | Coordinator |
| Alert | two missed check-ins in a row, or any flagged message or report | Coordinator |

We deliberately do not show an "hourly value" of the rent discount. The agreement states that help is not paid work, and an hourly figure would undercut that. This needs legal review before any pilot.

## Tokens (src/tokens.ts)

| Token | Value | Use |
|-------|-------|-----|
| ink | #222222 | text |
| muted | #6A6A6A | secondary text |
| line / soft | #DDDDDD / #EBEBEB | borders |
| surface | #FAFAF8 | tinted sections |
| purple 200 | #B9A2FF | brand accent: fills and illustration |
| purple 600 | #7050F8 | buttons, active states, saved heart |
| teal 300 | #3CD0BD | brand accent: fills and illustration |
| teal 700 | #0B7A6B | verified, positive text |

The raw brand colours fail as text on white (2.2:1 and 1.9:1), so they are used only as fills. The deepened colours reach about 5:1.

## Type and size

- Headings: Poppins (Noto Sans JP for Japanese). Body: DM Sans (Noto Sans JP for Japanese).
- Root size follows the persona and the text level (A / A+ / A++): host 18 / 20 / 22px, family 17 / 19 / 21px, housemate 16 / 18 / 20px. Everything in rem scales with it.
- Header and tab bar use fixed px sizes so navigation never overflows at the largest text size.
- Buttons are 40 / 48 / 56px tall (small / default / large). Text controls are never full-width unless they are the only action in a card.

## Layout

- Container up to 1440px, 80px side padding on wide screens, 16px on phones.
- Lists are 1 / 2 / 3 / 4 columns. Detail and agreement pages use a sticky right-hand card from 1024px.
- Wizards hide the tab bar and footer so the progress bar and Next button stay in one place.

## Known limits

- Translation is mocked: pre-written phrases and the seeded chats translate; other text is shown as written with a clear note.
- Guardrails are keyword matching in English and Japanese. A real product needs reviewed models and human review.
- Other hosts' replies are canned. Everything is stored in the browser, so two people cannot yet use it on two devices.
- Verification, e-signature, calls and the care-manager hand-off are mocks. Prices are examples until a pilot is agreed.
