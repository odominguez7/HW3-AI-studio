# Serendipity HTTP Copy + Section Spec

Use this as the source of truth for web routes and content.

## `/` Home

### Hero
- Headline: `Find your next real-world breakthrough.`
- Subhead: `Serendipity matches you with people, places, and moments that turn shared interests into real connection.`
- CTA 1: `Start Your Vibe Check`
- CTA 2: `Browse Live Sparks`

### Trust Ribbon
- `MIT/Harvard verified`
- `Campus-safe defaults`
- `Always reversible automation`

### How It Works
1. `Set your vibe and availability`
2. `Get affinity-matched spark suggestions`
3. `Meet, rate, and grow your connection graph`

### Spark Types
- Study Sync
- Coffee Clash
- Lunch Link
- Walk Wave
- Homework Hack
- Blitz Brainstorm

### Insight Teaser
- `This week: High-openness pairs in Lobby 13 had 2.1x repeat meets.`

## `/onboarding`

- Step 1: Email verification (`.edu`)
- Step 2: 10-question vibe check
- Step 3: Availability + intent mode
- Step 4: Automation slider (`Manual | Assisted | Autopilot`)
- Step 5: Privacy and safety defaults confirmation

Primary CTA: `Finish Setup`

## `/sparks`

- Card feed with:
  - match score,
  - spark type,
  - location safety badge,
  - suggested duration,
  - one-tap `Commit`.
- Filters:
  - `Tonight`
  - `Study`
  - `Founder`
  - `Low-energy`
  - `Group-only`

## `/sparks/:id`

- Spark detail view:
  - participants summary,
  - why matched,
  - suggested plan and location,
  - trust indicators,
  - `Commit` and `Pass`.

## `/offers`

- Two-column board:
  - `I Want`
  - `I Offer`
- Quick templates:
  - `GTM feedback for coffee`
  - `Code review for lunch`
  - `Meditation break for design critique`

## `/insights`

- Campus-level aggregate insights only.
- No individual private data disclosure.
- Example cards:
  - `Best times by vibe cohort`
  - `Highest repeat locations`
  - `Most successful spark formats`

## `/trust`

- Safety controls:
  - block/report
  - hidden mode
  - public-location preference
  - group-only mode
- Transparency:
  - trust policy,
  - moderation lifecycle,
  - report handling SLA.

## `/settings`

- Automation level
- Calendar permission toggles
- Notification cadence
- Visibility controls
- Data export/delete

## API Message Style Guidelines

- Avoid AI jargon in user-facing strings.
- Prefer language like:
  - `vibe match`
  - `spark suggestion`
  - `connection quality`
  - `safety check`

Avoid terms like:
- `LLM orchestration`
- `agent execution graph`
- `inference pipeline`

