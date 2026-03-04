# Serendipity Redesign Blueprint

This document redesigns YU Arena into **Serendipity** using the SparkMIT vision:

- Source vision: `SparkMIT — Agentic Serendipity for MIT's Elite.md`
- Goal: move from transaction optimization to real-world human connection outcomes

## 1) Product Reframe

### Old
- Revenue recovery platform
- Spots and claims
- Agent competition as primary narrative

### New
- Agent-assisted real-life connection platform
- Sparks and commitments
- Human outcomes as primary narrative

## 2) Core Promise

Serendipity helps verified users discover meaningful in-person connections through:
- affinity matching,
- context-aware scheduling,
- safe and reversible automation,
- feedback loops that improve connection quality.

## 3) KPI Shift (North Star + Supporting)

### North Star
- Repeat Meet Rate (7-day, 30-day)

### Supporting
- Connection Quality Score
- Screen-to-Street Conversion
- Trust & Safety Score
- Offer/Request Fulfillment Rate

## 4) Existing-to-New Domain Mapping

- `Spot` -> `SparkOpportunity`
- `Claim` -> `SparkCommitment`
- `RevenueEvent` -> `ConnectionEvent`
- `Operator` -> `HostNode` (club/lab/location/community)
- `DailyMetrics` -> `ConnectionMetrics`
- `Activity` -> unchanged pattern with new event types

## 5) New User Flows

1. Verify `.edu` identity and set onboarding preferences.
2. Complete 10-question vibe check (Big Five proxy).
3. Select mode: Manual, Assisted, or Autopilot.
4. Receive Spark opportunities in feed.
5. Accept one-tap and confirm logistics.
6. Submit post-meet rating and "what worked" signal.
7. Get continuity nudges for high-quality repeats.

## 6) Agent Roles (Infrastructure Layer)

- **Intent Agent**: understands current user intent.
- **Affinity Agent**: computes OCEAN-based compatibility.
- **Context Agent**: validates availability and timing windows.
- **Spark Designer Agent**: creates best format suggestion.
- **Safety Agent**: trust checks, reports, guardrails.
- **Continuity Agent**: follow-up and repeat relationship support.
- **Insights Agent**: produces aggregate "what works" intelligence.

## 7) HTTP Route Redesign

## Public App
- `GET /` -> Serendipity home
- `GET /onboarding`
- `GET /sparks`
- `GET /sparks/:id`
- `GET /offers`
- `GET /insights`
- `GET /trust`
- `GET /settings`

## API
- `POST /api/users/verify-edu`
- `POST /api/users/onboard`
- `POST /api/affinity/profile`
- `GET /api/sparks/recommendations`
- `POST /api/sparks/create`
- `POST /api/sparks/:id/commit`
- `POST /api/sparks/:id/feedback`
- `POST /api/offers/create`
- `GET /api/insights/campus`
- `POST /api/trust/report`
- `POST /api/trust/block`

## 8) Safety Defaults

- MIT/Harvard identity gates
- campus geofence defaults
- public/semi-public location defaults
- read-only calendar integration unless explicit write confirmation
- one-tap block/report
- no hidden automation; all automated decisions undoable

## 9) UI Information Architecture

- Hero: mission and quick actions
- Live Sparks: current opportunities
- Spark Types: study/coffee/walk/lunch/recess/hack
- Offers Exchange: wants/offers board
- Community Insights: aggregate patterns
- Safety & Trust: controls and transparency
- Settings: automation slider + consent controls

## 10) Migration Plan (Phased)

### Phase A (HW3-safe)
- Add Serendipity copy and section names.
- Keep current backend routes, map labels in UI.
- Add 6+ simulated agents using OpenClaw personas.
- Capture 60-120s proof video with multi-agent interaction.

### Phase B (Functional migration)
- Introduce spark API aliases and compatibility scoring.
- Add post-meet feedback endpoint and storage.
- Add trust/report flow and moderation records.

### Phase C (Intelligence layer)
- Add insights computations from interaction outcomes.
- Add repeat-meet and quality scoring dashboards.
- Add continuity nudges and cohort graphing.

## 11) HW3 Compliance Overlay

- 6+ agents total, 4+ classmates represented
- onboarding present and self-serve
- observability visible (activity + metrics)
- improved product surface demonstrated
- deployment + proof video + submission artifacts complete

## 12) Launch Narrative

Serendipity is not "AI replacing people."  
Serendipity is AI coordinating the right people, at the right moment, in the right place.

