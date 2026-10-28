# IDLETOIDEA (formerly UNLOCK)
**Shared-Resource Discovery & Fair Allocation Platform for Makerspaces & Innovation Centres**

> *Theme: Noir Cinema Black & Velvet Maroon with Soft Queen Pink touches in a cozy filmy aesthetic.*
> *Cinematic opening title screen with tap-to-enter transition.*

---

## 1. Problem Statement
Useful equipment and workspaces (3D printers, laser cutters, CNC mills, electronics assembly suites) frequently sit idle because creators do not know they exist, cannot compare conditions, or cannot navigate booking and training hurdles. Meanwhile, project teams face high purchase costs and unclear safety requirements. Conventional booking tools merely display calendar slots without addressing trust, risk-based eligibility, physical condition accountability, fair queue allocation, or auditable incident review.

**IDLETOIDEA** solves this by uniting:
1. Public equipment discovery and AI-powered project matching
2. Risk-tiered training verification (safety quizzes + supervisor physical sign-off)
3. Transactional overlap prevention and fair allocation caps
4. First-eligible transparent waitlist ordering with 24-hour offer windows
5. Physical handover & return condition audits with side-by-side comparison
6. Objective incident reviews with AI neutral summarization (allegations vs verified facts) and human resolution
7. Append-only institutional audit logging

---

## 2. Key Features

### Cinematic Opening Title & Aesthetic
- Full-screen cozy filmy intro displaying **IDLETOIDEA** in theme colors (noir black, deep velvet maroon, soft glowing queen pink).
- Requires a tap or click anywhere on screen to enter the main interface.
- Includes vintage film reel and roll motifs, ambient film grain, and quick return via the "Cinema Title" button.

### Risk-Based Safety & Certification
- **Low Risk** (Assembly bench, hand tools): Automatic eligibility upon rules acknowledgment.
- **Medium Risk** (Demo 3D Printer): 5-question safety quiz (80% pass mark, 3 attempts/day limit).
- **High Risk** (100W CO2 Laser Cutter, CNC Mill): Theory quiz passed + physical supervisor (Sam Iyer) verification sign-off.

### Fair Allocation & Overlap Prevention
- Active booking caps per user (default 2 for high-demand resources).
- Transactional overlap checks preventing double bookings.
- Transparent waitlist: ordered by first-eligible timestamp (tie-breaker: request ID).
- Automatic slot offering with 24-hour acceptance window when a booking is cancelled.

### Physical Handover & Condition Audit
- **Check-Out**: Baseline condition notes, accessories checklist, photo reference.
- **Return**: Post-session inspection, returned accessories verification, side-by-side condition comparison against check-out baseline.
- **Permanent Transfer Flow**: Separate handover workflow for giveaways and sales (never reuses temporary booking states).

### Staged Overdue Workflow & Demo Clock
- Demo Clock with quick controls: `+1 Hour`, `+1 Day`, `Jump Past Due Time`.
- Stage 1: Reminder
- Stage 2: Overdue flag
- Stage 3: Grace period (configurable per resource)
- Stage 4: Temporary restriction on new temporary bookings pending human review
- Stage 5: Resolution, restriction lifted, outcome logged

### Neutral Incident Handling & Gemini AI Summaries
- Prominent non-negotiable banner: *"Unreviewed report. Not a finding. An incident report is an allegation until formally reviewed."*
- Requester statement response form.
- Live Gemini 3.8 Flash neutral incident summarizer (`/api/gemini/summarize-incident`) which strictly separates reported allegations from verified system facts, identifies missing information, and provides an editable summary.
- Human review and resolution (no automatic blame or penalties).

### AI Matchmaker ("Find My Match")
- Live Gemini 3.8 Flash matcher (`/api/gemini/match`) that pre-filters active inventory against budget/location and suggests up to 3 best matches with explanations.
- Automatic keyword fallback if offline or no API key is provided.

---

## 3. Seeded Demo Accounts (Role Switcher)

Switch instantly between personas using the top-bar **Demo role switcher (for judges)**:

| User | Role | Role Badge | Initial State / Demo Purpose |
|---|---|---|---|
| **Aarav Rao** | Requester | Student | No quizzes taken. Demonstrates taking safety quiz & submitting request. |
| **Meera Nair** | Requester | Inventor | Passed 3D printer quiz. Holds #1 waitlist position on Kabir's slot; named in pre-seeded incident. |
| **Kabir Shah** | Requester | Startup | Holds confirmed 3D printer booking tomorrow 10:00 AM. Cancelling frees slot for Meera. |
| **Dr. Rhea Kapoor** | Owner | Faculty Manager | Spot-checked, Demo verified owner of 3D printer and bench room. |
| **Sam Iyer** | Supervisor | Safety Officer | Assigned supervisor for high-risk equipment; signs off hands-on certifications & handovers. |
| **Nisha Verma** | Admin | Platform Administrator | Oversees owner spot-checks, listing moderation, and append-only audit trail. |
| **Dev Menon** | Owner | Self-Registered | Unverified owner. High-risk listings require admin spot-check before publishing. |

---

## 4. The 10-Step Judge Journey

1. **Step 1 (Owner Lists Resource)**: Switch to Dr. Rhea Kapoor or Dev Menon. Open *New Equipment Listing*, click *Fill with Example*, and publish.
2. **Step 2 (Discover & Check Eligibility)**: Switch to Aarav Rao. Use *Find My Match* AI or browse to Demo 3D Printer. See unmet eligibility checklist, click *Take Safety Quiz Now*, and pass (80%+).
3. **Step 3 (Submit Booking Request)**: Pick an available time slot, write a note, and submit. Status is *Pending review* (never falsely confirmed).
4. **Step 4 (System Verifies Requirements)**: In *My Requests*, verify the snapshot of safety training, booking cap, and overlap prevention.
5. **Step 5 (Review Queue)**: Switch to Supervisor Sam Iyer or Dr. Kapoor. Open *Review Queue* and click *Approve & Reserve Slot* with reason code `APPROVED_ELIGIBLE`.
6. **Step 6 (Waitlist & Fair Allocation)**: Switch to Meera Nair to view her #1 waitlist position. Switch to Kabir Shah and cancel his 10:00 AM booking; see the freed slot offered to Meera with a 24-hour acceptance window!
7. **Step 7 (Check-In Inspection)**: As Sam Iyer, open *Active Bookings* and record check-out condition notes and accessory checklist. Status moves to *In use*.
8. **Step 8 (Return Inspection)**: Record return condition, view the side-by-side Before/After comparison, and finalize return.
9. **Step 9 (Overdue & Incident Review)**: Use the Demo Clock to trigger overdue stages; open the pre-seeded incident on 3D Printer, generate the Gemini AI neutral summary, and record a fair human resolution.
10. **Step 10 (Audit Log & Timeline)**: In *Admin & Audit Log*, view the complete immutable append-only event stream; open any request's timeline to verify identical histories visible to both parties.

---

## 5. Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, Motion.
- **Server**: Express server (`server.ts`) running on port 3000 mounting Vite middleware in dev mode and serving production builds.
- **AI SDK**: `@google/genai` (v2.4.0) with model `gemini-3.8-flash` called exclusively on the server side with robust rule-based fallbacks.
- **Data Store**: Reactive client-side `DataStore` persisted to `localStorage` with full repository interface (`get`, `list`, `update`, `transaction`).
- **Service Layer**: Single unified API (`IdleToIdeaService`) enforcing all business logic, permission gates, state machines, cap calculations, and audit logging.

### Path to Firebase Migration
The repository interfaces in `src/types.ts` and `src/services/store.ts` mirror Firestore document collections (`users`, `resources`, `requests`, `waitlistEntries`, `handoverRecords`, `incidents`, `auditLogs`). Migrating involves replacing `dataStore.update()` with Firestore batch writes/transactions and mapping Firebase Auth UID to `User.id`.

---

## 6. Simulation & Prototype Disclaimers

All of the following carry visible simulation labels throughout the user interface:
- **Payments**: *"Simulation only. No real money is moved."* (Fictional INR fees).
- **Verification**: *"Demo verified"* or *"Unverified owner"* (Institutional spot-checks).
- **Notifications**: *"Demo notification"* (In-app simulation; no external email spam).
- **AI Output**: *"AI-generated summary / recommendation. Advisory only. Never overrides safety rules."*
- **Seeded Data**: All institutions, facilities, and personal names are purely fictional.
