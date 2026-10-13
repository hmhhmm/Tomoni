# Tomoni Homeshare: design notes

Concept prototype for the Tokyo Global Innovation Challenge 2026 (Idea Category).
All people, prices and organisations in the UI are fictional examples.

## How these notes were made

The links below were checked for reachability on 2026-10-13 (HTTP 200). The patterns
are summarised from my working knowledge of these sources, not copied from them, and
nothing here was validated with real users. Please read the originals before quoting
them in the pitch.

## References and what we borrowed

| # | Source | Pattern borrowed | Where it shows up |
|---|--------|------------------|-------------------|
| 1 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), incl. [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) and [Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html) | AA contrast, 24px minimum targets (we go to 48px+), help in the same place on every screen | Contrast table below; the Safety shield sits in the same header slot on every screen |
| 2 | [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Dynamic-type thinking, labels on every control, no gesture-only actions | Text-size toggle (A / A+ / A++), every icon has a text label, no swipe-only actions |
| 3 | [Material 3: Accessible design](https://m3.material.io/foundations/accessible-design/overview) | 48dp touch targets, clear focus states, colour never the only signal | `min-h-12` controls (48px tenant, 60px host), 3px focus ring, status chips always carry text |
| 4 | [NN/g: Usability for senior citizens](https://www.nngroup.com/articles/usability-for-senior-citizens/) | Larger type, plain wording, fewer simultaneous choices, forgiving interactions | Host base text 20px, one primary action per screen, Undo on "Not now" and on ending a trial |
| 5 | [Airbnb Design](https://airbnb.design/) | Listing card, gallery, price breakdown, filters + map: the mental model people already know | Browse (search, filters, map preview, cards) and Listing detail (gallery, host card, cost breakdown, Apply) |
| 6 | [Airbnb Trust and safety](https://www.airbnb.com/trust) | Verified badges, in-product reporting, human support behind the product | Verified ✓ badge, Report a problem, Talk to a coordinator |
| 7 | [Uber Safety](https://www.uber.com/us/en/safety/) | A persistent safety shield, one-tap emergency access, trusted contacts | Shield in the header of every screen, Emergency card (110 / 119), opt-in Family dashboard |
| 8 | [Stripe: Designing accessible color systems](https://stripe.com/blog/accessible-color-systems) and [Linear: UI redesign](https://linear.app/blog/how-we-redesigned-the-linear-ui) | Colour built from a few calm accents with contrast checked, restrained surfaces, soft layered shadows | `src/tokens.ts`; white cards on #FAFAF8, hairline borders, one accent per screen |
| 9 | Bumble's in-app safety tools (block and report, ID verification). No link, because the page I tried returned 404 | Safety actions that are visible and private, not buried in settings | Private "Report a concern", anonymous monthly pulse |

Also relevant, not used directly: the [Japan Digital Agency Design System](https://design.digital.go.jp/dads/) for Japanese typography and wording conventions.

## Principles

1. **The host is always in control.** Every consequential step has a plain "Not now" or an undo. Nothing starts without the host's yes.
2. **Safety is a layer, not a page.** The shield is persistent. Guardrails act inside the conversation, where the risk appears.
3. **Not a job board.** We never say work, wage, salary, hire or employee. The pact says "help", "household", "housemate". The only exception is the "Work-hours tracker" label, which the brief names explicitly and which is a legal limit, not a task.
4. **Calm, warm, trustworthy.** Light mode only, generous space, soft purple and teal accents, no alarms unless safety requires them.
5. **Senior-first, tenant-dense.** Same components, different scale: the root font size is 20px for hosts, 18px for family, 16px for tenants, so rem-based spacing and targets scale together.

## Tokens (src/tokens.ts)

| Token | Value | Use |
|-------|-------|-----|
| bg | #FAFAF8 | page background |
| card | #FFFFFF | cards, sheets |
| ink | #151517 | body text |
| muted | #6B6B70 | secondary text |
| line | #E7E5E0 | hairline borders |
| purple 200 | #B9A2FF | brand accent: fills, illustration |
| purple 600 | #7050F8 | text and buttons on white |
| teal 300 | #3CD0BD | brand accent: fills, illustration |
| teal 700 | #0B7A6B | text on white |

The deck colours are deepened rather than replaced. The raw brand colours fail as text on white (2.2:1 and 1.9:1), so they are used only as fills and illustration.

### Measured contrast (WCAG relative luminance)

| Pair | Ratio |
|------|-------|
| ink on bg | 17.5 |
| muted on bg | 5.1 |
| muted on purple 50 | 4.8 |
| purple 600 on white (also white on purple 600) | 5.0 |
| teal 700 on white (also white on teal 700) | 5.2 |
| teal 700 on teal 50 | 4.8 |
| amber 700 on amber 50 | 5.9 |
| rose 700 on rose 50 | 5.9 |

## Type

- Headings: Poppins (Noto Sans JP for Japanese). Body: DM Sans (Noto Sans JP for Japanese).
- Scale in rem, so the text-size toggle scales everything: 0.85 / 0.95 / 1 / 1.125 / 1.25 / 1.6.
- Header and tab bar use fixed px sizes, so the chrome never overflows at A++.

## Layout

- Primary view is a 390 x 844 phone frame, centred on desktop. On a real phone it is full-bleed.
- The coordinator view is a separate desktop layout, labelled "Concept view".
- The demo panel sits beside the phone on wide screens and becomes a bottom sheet on narrow ones.

## Known limits

- Translation is mocked. Only the pre-written phrases and seeded history translate; anything else shows a clearly labelled demo note.
- Guardrails are keyword matching, in English and Japanese. A real product would need a reviewed classifier plus human review.
- The 28h student tracker counts help hours conservatively. Real eligibility rules need legal review.
- The check-in, verification, e-sign, phone and care-manager actions are all mocks.
