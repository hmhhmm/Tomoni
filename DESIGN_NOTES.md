# Tomoni Homeshare: design notes

Concept prototype for the Tokyo Global Innovation Challenge 2026 (Idea Category).
All people, prices and organisations in the UI are fictional examples.

## Direction

Tomoni is a **web app**, designed in the way people already know from Airbnb: a photo-first marketplace on the guest side, a calm "Today" workspace on the host side. The accent colour is used sparingly, the surfaces are white, and the safety layer is always one tap away.

### Airbnb patterns we borrowed

Airbnb publishes no public design system. The notes below come from community reverse-engineering and from how the product behaves, so treat exact values as approximate.

| Pattern | How it appears in Tomoni |
|---------|--------------------------|
| Pill search bar with segmented fields and a round accent button | Explore: Where / Move in / Monthly cost, with a red search orb |
| Icon category row under the search | Explore: Light help, Company only, Pets welcome, Near station, English spoken, Under ¥45k, Women only |
| "Filters" modal with a live "Show N rooms" button | Explore filters: price range, arrangement type, help hours, walk time, language, preference, pets |
| Photo-first cards, no shadow, heart top-right, carousel dots | Listing cards: 5-picture carousel, save heart (persisted), status pill |
| List with a map toggle ("Show map") | Explore list or split list + price-pin map |
| Photo mosaic (1 large + 4) with "Show all photos" | Listing detail |
| Two-column detail with a sticky booking card | Listing detail: cost breakdown, your fit, Apply |
| "Things to know": rules, safety, stay | Listing detail footer sections |
| Focused host onboarding with a segmented bottom progress bar | Create listing and help picker wizard |
| Host "Today" tab with a to-do list | Host Today: logged help to confirm comes first, then the journey and to-dos |
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
| Weekly help hours | Sum of hours across selected tasks, hard cap 10 | Help picker, Agreement, Today, Stay |
| Monthly help hours | weekly hours × 52 / 12 | Listing detail |
| Discount | (standard rent − homeshare rent) / standard rent | Listing editor |
| Monthly all-in cost | homeshare rent + ¥8,000 membership | Cards, filters, detail |
| Net saving | standard rent − all-in cost; yearly = × 12 | Listing detail |
| Suggested rent band | 40% to 65% of standard rent | Listing editor |
| Match score (0–100) | 40 tasks they can do (hour-weighted) + 25 free help times (hour-weighted) + 20 shared language (native/fluent 1.0, conversational 0.85, basic 0.5, none 0.3) + 15 ID verified | Applicants |
| Your fit | Same inputs, from the housemate's profile | Listing detail |
| Student limit | other hours + help hours ≤ 28 per week: logging is blocked above 28, warning from 24 | Task log |
| Trial day | days since the trial started, capped at the trial length | Stay, Today |
| Alert | two missed check-ins in a row, or any open flagged message, report, family message or private message | Coordinator |
| Response deadline | raised time + 24 h for safety items (money, care, romance, reports, "not right" check-ins, private messages); + 5 working days otherwise (weekends skipped) | Coordinator |
| Coordinator time per case | minutes logged on the case (seeded cases are illustrative) | Coordinator case detail |
| Anonymous pulse | counts of Great / Fine / Not great per question, pooled across homes | Coordinator |

We deliberately do not show an "hourly value" of the rent discount. The agreement states that help is not paid work, and an hourly figure would undercut that. This needs legal review before any pilot.

## Tokens (src/tokens.ts)

| Token | Value | Use |
|-------|-------|-----|
| ink | #222222 | text |
| muted | #6A6A6A | secondary text |
| line / soft | #DDDDDD / #EBEBEB | card hairlines and dividers |
| field | #8A8A8A | outlines of inputs, steppers and pills (3.45:1, meets WCAG 1.4.11) |
| surface | #FAFAF8 | tinted sections |
| brand 500 | #FF385C | Airbnb-style red: logo tile and fills only |
| brand 400 → 600 → 700 | #E61E4D → #E31C5F → #D70466 | primary button gradient; 600 is solid buttons, active nav, badges; 700 is red text |
| teal 300 | #3CD0BD | brand accent: fills and illustration |
| teal 700 | #0B7A6B | verified, positive text |

The logo red (3.5:1) and the raw teal (1.9:1) fail as text on white, so they are used only as fills. Brand 600 (4.6:1), brand 700 (5.1:1) and teal 700 (5.2:1) pass AA as text and with white text.

Red is kept for the main action and the active place; teal means safe or done; amber means waiting or a limit; rose means a real problem. Mrs Sato's illustrations use a warm neutral hue (`SATO_HUE`) so they never compete with the red.

The brand accent was purple (#7050F8) until October 2026 and was changed to red after user feedback.

## Buttons

Each colour has one job, after Airbnb (red for the action that matters, black for everything ordinary):

| Style | Use | Examples |
|-------|-----|----------|
| Red gradient (`primary`) | The one step that moves the stay forward. At most one visible per screen | Apply, Confirm and send (meet-up), Start the trial, Sign, Approve agreement, Log today's help, Send check-in |
| Black (`dark`) | Ordinary progress and routine sends | Chat Send, wizard Next, Show N rooms, Message the coordinator |
| Outlined (`secondary`) | Alternatives and secondary paths | Message, View stay, Edit meet-up, the journey button while tasks wait to be confirmed |
| Teal (`teal`) | Safety, and "done / all good" | Confirm task, Safety Centre, Call support, Send report |
| Danger (`danger`) and rose text | Serious or irreversible | Refer to police, report to the municipal desk; Reject is a quiet rose text button |

Explore's round search button stays red as the one exception: it is the signature search control, not a text button.

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
- Check-in photos are previewed in the browser only; the prototype records just that a photo was attached.
- Referral buttons on the coordinator desk only record the action and time; nothing is sent.
- Response deadlines skip weekends but not Japanese public holidays.
- The page language is shared by every view on one device: switch the language when switching between Mrs Sato and Aisyah in a demo.
