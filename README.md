# Serendipity

**Real connections, agentic precision.**

Serendipity is an AI-powered campus connection platform that turns free moments into meaningful in-person meets. It uses Big Five (OCEAN) affinity matching, agent-assisted scheduling, and feedback loops to help verified MIT/Harvard users discover their tribe.

## Quick Start (Local)

```bash
# 1. Clone and install
git clone https://github.com/odominguez7/HW3-AI-studio.git
cd HW3-AI-studio
npm install

# 2. Start Postgres
docker compose up db -d

# 3. Set env
cp .env.example .env
# Edit DATABASE_URL if needed

# 4. Push schema and seed
npx prisma db push
npm run db:seed

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Google Cloud Run

```bash
# Build and push container
gcloud builds submit --tag gcr.io/PROJECT_ID/serendipity

# Deploy
gcloud run deploy serendipity \
  --image gcr.io/PROJECT_ID/serendipity \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="YOUR_CLOUD_SQL_URL"
```

## Project Structure

```
app/
  page.tsx              Home (Hero + How it Works + Spark Types)
  layout.tsx            App shell + Navigation
  globals.css           Tailwind + custom theme
  onboarding/page.tsx   Vibe check + preferences
  sparks/page.tsx       Browse spark opportunities
  sparks/[id]/page.tsx  Spark detail + commit + feedback
  offers/page.tsx       Value-for-value exchange board
  insights/page.tsx     Campus-level connection intelligence
  trust/page.tsx        Safety controls + reporting
  settings/page.tsx     User preferences
  api/
    health/             GET  health check
    users/verify-edu/   POST email verification
    users/onboard/      POST preferences + automation mode
    affinity/profile/   POST Big Five profile
    sparks/
      recommendations/  GET  personalized spark feed
      create/           POST new spark opportunity
      [id]/commit/      POST commit to a spark
      [id]/feedback/    POST post-meet rating
    offers/create/      GET+POST value exchange board
    insights/campus/    GET  aggregate insights
    trust/report/       POST safety incident
    trust/block/        POST block user

components/             Reusable UI components
lib/
  db.ts                 Prisma client singleton
  schemas.ts            Zod validation schemas
  affinity.ts           OCEAN matching + vibe check scoring
  api.ts                Response helpers
prisma/
  schema.prisma         Full data model
  seed.ts               7 demo personas + 8 sparks + 5 offers
```

## Tech Stack

- **Framework**: Next.js 14 (App Router, standalone output)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS (dark theme, custom spark/night palette)
- **Animation**: Framer Motion
- **Validation**: Zod
- **Deployment**: Docker + Google Cloud Run

## Affinity Matching

Users complete a 10-question "Vibe Check" mapped to Big Five (OCEAN) personality traits. Matching uses cosine similarity between OCEAN vectors. Scores >= 70% are "core matches"; strategic complements are surfaced for growth.

## HW3 Compliance

- 6+ agents (7 seeded personas + self-serve onboarding)
- Self-serve join flow (onboarding wizard)
- Observability (insights dashboard + activity feed)
- Product improvement (full redesign from revenue recovery to human connection)
- Deployment-ready (Docker + Cloud Run)
