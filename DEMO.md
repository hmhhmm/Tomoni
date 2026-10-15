# Tomoni Homeshare: end-to-end demo

> **A spare room for a helping hand, safely matched.**

This is the script for showing the Tomoni prototype from start to finish. For each step it says **what to click**, **what the audience should notice**, and **which part of the idea it proves**. All people, rooms and prices are fictional examples, and this is a concept prototype: legal review is required before any real pilot.

---

## 1. What we are trying to achieve

Japan has two groups who are each turned away, and who each have what the other needs.

| | Older homeowners living alone | Students and young workers, many from abroad |
|---|---|---|
| **The problem** | 29.3% of people in Japan are 65 or older (Cabinet Office, 2025). In 2024, 76,020 people living alone were found dead at home (National Police Agency). Isolation is a health risk. | 39.3% of foreign residents who looked for housing were refused for being foreign (Ministry of Justice survey, 2017). Rents near universities are high. |
| **What they have** | A spare room in a home they own | Time, energy and company |
| **What they need** | Someone in the house, and a little everyday help | An affordable room in a real home |

**Tomoni** matches them. The older homeowner rents a spare room at a lower rent, fixed in the lease. The housemate gives **light, voluntary help, capped at 10 hours a week**, for example shopping, the garden, cooking together or company. **The host always decides.**

Homeshare already works in the UK, Canada and Kyoto, but the Kyoto programme made about 72 matches in 10 years by hand. Tomoni's difference is **the safety layer and the coordinator's tools**, built so more matches can happen safely, including with foreign residents:

1. **Safety by design.** The app enforces the rules (the hour cap, no personal care, no handling money) instead of just stating them.
2. **Plain, two-language agreements**, with translation in chat.
3. **A human coordinator** who sees what matters, with the tools to act.
4. **Family reassurance that the host controls**, without surveillance.

The demo below shows each of these working.

---

## 2. Before you start

- Run `npm run dev` and open **http://localhost:5173**.
- Open the **menu** (top right, the avatar button). It switches between the three people. Everything happens on one device, with data saved in the browser.
- **Start clean:** menu → **Start over with fresh sample data**.
- **Language:** the dropdown in the header sets the page language for whoever is using the app. To show translation, set **日本語** while acting as Mrs Sato and **English** while acting as Aisyah. (The language is shared on one device, so switch it when you switch person.)
- **Use one browser tab.** If you open the coordinator desk in a second tab, it updates by itself, but a single tab is simplest on camera.
- For the photo step, have a **JPG or PNG** ready.

### The cast

| Person | Who | Where in the app |
|---|---|---|
| **Mrs Sato**, 81, Nerima | Host, lives alone, has a spare room | `/saito` |
| **Aisyah**, 22, Malaysian master's student | Housemate looking for a room | `/aisha` |
| **Emi** | Mrs Sato's daughter in Osaka | `/family` |
| **Coordinator** | Tomoni staff | `/coordinator` |

---

## 3. The 70-second video cut

For the demo segment of the pitch video (1:30–2:40). Set up beforehand: menu → **Start over with fresh sample data**, then menu → **Hosting as Mrs Sato**, then set the language to 日本語.

| Time | Do | Say (one line each) |
|---|---|---|
| 0:00 | **Applicants**: Aisyah sits at the top with her match score → **View profile** → **Message** | "Mrs Sato sees verified applicants, ranked by how well they fit the help she asked for. She decides." |
| 0:10 | In chat, tap a quick reply or type **お風呂を手伝ってくれますか？** ("Can you help me bathe?") | "She asks in Japanese. Aisyah reads it in English." |
| 0:18 | The **"Care is not part of homeshare"** card appears | "Personal care is never part of homeshare. Tomoni points her to her care manager instead." |
| 0:25 | **Plan a meet-up** → pick a time → **Confirm and send** | "They meet in person first." |
| 0:32 | Menu → **Load sample: week 3 of living together** | "Three weeks later…" |
| 0:36 | Menu → **Finding a room as Aisyah** (switch to English) → **Task log** → tap **Cooking** → **2 h** | "Aisyah logs her help in two taps. The weekly cap is 10 hours." |
| 0:45 | Menu → **Hosting as Mrs Sato** → **Today** → **Confirm** | "Mrs Sato confirms it with one tap." |
| 0:50 | **Stay → Check-in → All good**, add a photo, tick **Also share with Emi** → **Send check-in** | "Every week she answers one question. The photo goes to her coordinator, and to Emi only because she chose to share it." |
| 1:00 | Menu → **Family view as Emi** | "Her daughter in Osaka sees that all is well, but never their private messages." |
| 1:05 | Menu → **Coordinator desk**, click the Sato case | "And a Tomoni coordinator sees every home at a glance, with the tools to act." |

---

## 4. The full walkthrough (about 12 minutes)

For live demos, judges' questions or a longer recording. Start with menu → **Start over with fresh sample data**. Follow the steps in order: some later steps depend on earlier ones.

### Act 1: Finding each other

**1. The landing page** (`/`)
- *Notice:* the one-line promise, who it's for (with sourced numbers), the four steps (Meet → Try a short stay → Agree in plain words → Live together) and "Safe by design".
- *Proves:* the problem and the answer on one page.

**2. Aisyah explores** (menu → **Finding a room as Aisyah**, language English)
- Explore rooms with the search bar, categories and **Filters**. Tap the heart to save a room, then use the **Saved** button.
- Open Mrs Sato's room in Nerima. *Notice:* the cost breakdown (rent plus the ¥8,000 membership), **How you fit**, the help she asked for, and "Things to know".
- *Proves:* it's a familiar, Airbnb-style marketplace, so there's nothing new to learn.

**3. Verification** (menu → Account → Verification)
- The ID check explains what is kept (result, residence status, expiry) and what is deleted (card and selfie images), and starts only after **"I agree to this ID check…"**.
- Students confirm **資格外活動許可** (permission for part-time work). Without it, they only see companionship-only rooms.
- *Proves:* privacy law (APPI) and immigration limits are handled by design.

**4. Mrs Sato reviews applicants** (menu → **Hosting as Mrs Sato**, language 日本語)
- **Applicants**: cards ranked by match score. **View profile** opens the full profile with **Message**, **Plan a meet-up** and **Reject**.
- *Notice:* "How is the score worked out?" The score only orders the list; the host decides.
- *Proves:* the host is in control.

**5. Chat with translation and guardrails** (**Message** Aisyah)
- Send a quick reply in Japanese. Switch to Aisyah (English) and it reads in English, with the original beneath and an "AI-assisted" label.
- Try these as Mrs Sato:
  - **お風呂を手伝ってくれますか？** shows the care-manager card.
  - **5万円貸してもらえますか？** ("Could you lend me 50,000 yen?") shows the money warning and flags the coordinator.
- *Proves:* the two groups can talk across languages, and risky requests are caught in English and Japanese.

### Act 2: Meeting, trying, agreeing

**6. Plan a meet-up** (Mrs Sato's chat: **Plan a meet-up**)
- Pick a time → **Confirm and send**. A "Meet-up planned" notice appears in both people's chat.
- **Start the trial stay** stays disabled until Aisyah confirms.

**7. Aisyah confirms** (menu → **Finding a room as Aisyah**)
- Explore now opens with a **card for her stay**. Use **Confirm the meet-up** → **Confirm this time** in chat.
- *Notice:* her **private chat** with the coordinator is pinned at the top of Messages, and Mrs Sato never sees it.

**8. Trial stay** (back to Mrs Sato → **Stay**)
- Choose 2–4 weeks → **Start the trial stay**. Either side can end it with one tap, with no penalty.
- **Continue to the agreement.**

**9. The Living Together Pact** (Stay → **Agreement** tab)
- First as **Aisyah**: tap **I can't do this** on any task, then **Sign**.
- Then as **Mrs Sato**: she sees the declined task crossed out → **Sign**.
- *Notice:* "Not an employment contract. The rent is fixed in the lease and is not payment for help." The banned list (bathing, toileting, feeding, medical acts, money, cards and seals). The 10-hour meter. The watermark "Draft - to be reviewed by licensed professionals".
- *Notice:* any change to the tasks clears both signatures, so nobody is held to tasks they didn't see.
- *Proves:* help is voluntary, light and capped, and both sides consent. This is the answer to "Isn't this unpaid labour?".

**10. The coordinator approves** (menu → **Coordinator desk**, Sato case)
- **Approve agreement** stays disabled until the **Safeguarding checks** are ticked: met the host alone, references checked, home safety check.
- Tick all three → **Approve agreement**. Mrs Sato and Aisyah are now living together.
- *Proves:* a human coordinator, not an algorithm, is the final check.

### Act 3: Living together

**11. Family opts in** (menu → **Family view as Emi**)
- The invite lists what Emi will see and what she never sees → **Yes, I would like to follow along**.
- *Proves:* family access is opt-in and can be stopped at any time.

**12. Aisyah logs help** (menu → **Finding a room as Aisyah** → **Task log**)
- **Log today's help**: tap a task → tap the hours. Check the "This week" ring and the 28-hour student tracker.
- *Notice:* students can't log beyond 28 hours a week, and nobody can go beyond 10 hours of help.

**13. Mrs Sato confirms and checks in** (menu → **Hosting as Mrs Sato**)
- **Today** opens with "Aisyah logged 1 task. Please confirm it" → **Confirm**.
- **Stay → Check-in**: **All good**, an optional voice note and photo → tick **Also share with Emi** → **Send check-in**.
- *Notice:* "Your coordinator sees the photo and hears the voice note. They are deleted after 30 days."

**14. Emi's view** (menu → **Family view as Emi**)
- The week's status, help hours, the agreed help under "Coming up", **This week in brief** and **Shared by Mrs Sato**.
- **Contact the coordinator** sends a message to the desk.
- *Proves:* family reassurance without surveillance.

**15. The coordinator desk** (menu → **Coordinator desk**)
- **Alerts** come first, sorted by deadline: 24 hours for safety items, 5 working days for the rest. The sample data includes an overdue item on another case.
- Click any case to see why it has its status and what to do next.
- **Safeguarding and referrals**: the checklist, **Pause the arrangement**, and referrals that are logged with a time (family, care manager, municipal elder-abuse desk, police).
- **Private chat** with Aisyah, **Check-in photos and voice notes** (with "Keep as evidence"), and **Escalation, time and notes**, a 6-step escalation ladder.
- **Housemate pulse (anonymous)**: answers pooled across homes and never tied to a name.
- *Proves:* "We make coordinators faster." One person can run many homes safely.

**16. When something goes wrong** (optional)
- As Mrs Sato, answer **Something's not right** in the check-in. As Aisyah, write in the private chat or answer "Not great" in the monthly pulse (Account → Monthly pulse).
- On the desk: new alerts with deadlines, **Log a call (step 2)**, and **Pause the arrangement**, which puts tasks on hold and shows a notice to both people.
- **Safety** (the red button in the header, on every screen): 110 / 119, the 24-hour support line, and a private report.

---

## 5. Idea → prototype: where each claim is shown

| What we say in the pitch | Where the prototype shows it |
|---|---|
| Older people living alone, refused renters: both sides gain | Landing page; Explore and room detail (cost and saving); Mrs Sato's applicants |
| Help is light, voluntary and capped at 10 h a week | Help picker meter; agreement (any task can be declined); task log blocks above 10 h |
| No personal care, no money handling | Banned list in the agreement; chat guardrails (care card, money warning) in English and Japanese |
| Not employment: rent is fixed in the lease | Agreement section 2; listing editor wording |
| Student visa limits are respected | 資格外活動許可 check at verification; 28 h tracker that blocks; companionship-only rooms |
| Foreign residents included, across languages | Japanese/English everywhere; translated chat with the original beneath |
| The host always decides | Ranked list, profiles, Reject; host signs; trial can be ended in one tap |
| Meet first, then a trial stay | Meet-up booking, Aisyah's confirmation, trial that needs it, end trial with no penalty |
| Human coordinators, not an algorithm | Safeguarding checks before approval; desk with alerts, deadlines, referrals, escalation, private line, pause |
| Family reassurance without surveillance | Opt-in invite; weekly status, hours, agreed help, summary; photos only when the host shares; never messages |
| Privacy by design | ID data minimised; photos deleted after 30 days; anonymous pulse; private housemate line |
| Make coordinators faster | One desk for all cases: status reasons, the next action per case, time logged per case |

---

## 6. What is real and what is simulated

| Real in the prototype | Simulated (planned for the pilot) |
|---|---|
| Every screen and flow above, in English and Japanese | ID check (eKYC), e-signature, phone calls, the care-manager hand-off |
| Hour cap, 28 h limit, consent rules, guardrails, deadlines | Translation is prepared phrases only (live AI translation in the pilot) |
| Agreement editing, signatures, coordinator approval | No server: data lives in this browser; other hosts' replies are canned |
| Check-in photo (kept small, in this browser) and sharing rules | Voice notes record their length, not audio |
| Coordinator tools and the anonymous pulse | Referral buttons record the action but send nothing |

Rent, membership and match numbers are examples until a pilot is agreed. Not built yet (pilot plan): five-language AI translation, AI chat summaries for coordinators, visa-expiry reminders, a monthly-call schedule, private two-way ratings, and impact measures such as a loneliness score.

---

## 7. Likely questions, and where to show the answer

- **"Isn't this unpaid labour?"** Agreement section 2 (rent fixed in the lease), the "I can't do this" buttons, and the 10 h cap that blocks.
- **"What if a housemate exploits Mrs Sato?"** The money guardrail flags the coordinator, the banned list, the referrals, and pause.
- **"What if the host exploits the housemate?"** Aisyah's private coordinator chat, the anonymous pulse, and the "I can't do this" buttons.
- **"Why would an 81-year-old use an app?"** Text size A / A+ / A++ in the header, two-tap check-ins, and family and coordinator help. The coordinator does the hard parts.
- **"Kyoto already does this."** The coordinator desk: Kyoto proves the demand, and Tomoni gives its coordinators tools to match more people safely, including foreign residents.

---

## 8. If something looks wrong

- **Data looks odd:** menu → **Start over with fresh sample data**, or **Load sample: week 3 of living together** to jump ahead.
- **"Start the trial stay" is disabled:** Aisyah hasn't confirmed the meet-up in her chat yet.
- **"Approve agreement" is disabled:** tick the three safeguarding checks on the Sato case.
- **"Also share with Emi" is greyed out:** Emi hasn't accepted the family invite, or there's no photo or voice note yet.
- **A photo doesn't appear:** use a JPG or PNG (iPhone HEIC photos can't be read), and wait for "Preparing photo…" to finish.
- **A screen still shows old data:** refresh it once.
