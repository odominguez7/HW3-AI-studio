# YU Arena: Complete Option B Implementation Guide
## Execute Dual Deployment (East + Central) in 2 Days

---

## QUICK START OVERVIEW

**Goal**: Deploy YU Arena as two separate instances by end of Day 2

**Timeline**:
- **Day 1 (4-6 hours)**: Configuration + Code Changes + First Deployment
- **Day 2 (2-3 hours)**: Testing + Polish + HW3 Validation

**What You'll Have**:
- ✅ US-EAST1: Vendor control panel (authenticated)
- ✅ US-CENTRAL1: Public user claim flow (no auth)
- ✅ Shared PostgreSQL database
- ✅ Agents connecting to vendor instance
- ✅ Full HW3 compliance
- ✅ VC-ready architecture

---

## TABLE OF CONTENTS

1. [Prerequisites Checklist](#prerequisites-checklist)
2. [Day 1: Configuration & Deployment](#day-1-configuration--deployment)
3. [Day 2: Testing & Validation](#day-2-testing--validation)
4. [Complete Code Files](#complete-code-files)
5. [Deployment Scripts](#deployment-scripts)
6. [Testing Scripts](#testing-scripts)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [HW3 Submission Checklist](#hw3-submission-checklist)

---

## PREREQUISITES CHECKLIST

### Before You Start (15 minutes)

**Verify You Have**:
- [ ] Access to GCP project with Cloud Run enabled
- [ ] Cloud SQL PostgreSQL instance running
- [ ] Database credentials (host, user, password)
- [ ] Twilio account with WhatsApp enabled
- [ ] GitHub repo with current code
- [ ] Node.js 18+ installed locally
- [ ] `gcloud` CLI installed and authenticated

**Check Current State**:
```bash
# Verify you can access your database
psql "postgresql://<user>:<password>@<host>:5432/yu_arena_prod"

# Verify Cloud Run access
gcloud run services list --region=us-east1

# Verify current deployment
curl https://yu-arena-381932264033.us-east1.run.app/api/health
```

**Project Structure** (verify these exist):
```
your-project/
├── web/                    # React frontend
│   ├── src/
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   └── package.json
├── agents/                 # Agent code
│   ├── hawk/
│   └── ace/
├── .env.example
└── package.json
```

---

## DAY 1: CONFIGURATION & DEPLOYMENT

### PHASE 1: Database Setup (30 minutes)

#### Step 1.1: Create Database Users

Connect to your PostgreSQL database:
```bash
psql "postgresql://<admin-user>:<password>@<host>:5432/yu_arena_prod"
```

Create three users with appropriate permissions:
```sql
-- 1. Vendor user (full access for East instance)
CREATE USER yu_vendor_user WITH PASSWORD 'CHANGE_THIS_STRONG_PASSWORD_1';
GRANT ALL PRIVILEGES ON DATABASE yu_arena_prod TO yu_vendor_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yu_vendor_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yu_vendor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO yu_vendor_user;

-- 2. User readonly (limited access for Central instance)
CREATE USER yu_user_readonly WITH PASSWORD 'CHANGE_THIS_STRONG_PASSWORD_2';
GRANT CONNECT ON DATABASE yu_arena_prod TO yu_user_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO yu_user_readonly;
GRANT INSERT, UPDATE ON claims TO yu_user_readonly;
GRANT INSERT ON operator_events TO yu_user_readonly;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yu_user_readonly;

-- 3. Agent user (mixed access)
CREATE USER yu_agent_user WITH PASSWORD 'CHANGE_THIS_STRONG_PASSWORD_3';
GRANT CONNECT ON DATABASE yu_arena_prod TO yu_agent_user;
GRANT SELECT ON drops, agents, offerings, operators TO yu_agent_user;
GRANT INSERT ON revenue_events, claims, operator_events TO yu_agent_user;
GRANT UPDATE (status) ON drops TO yu_agent_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yu_agent_user;

-- Verify permissions
\du yu_vendor_user
\du yu_user_readonly
\du yu_agent_user
```

**Save these passwords securely** - you'll need them in environment files.

#### Step 1.2: Test Database Connections

```bash
# Test vendor user (should work)
psql "postgresql://yu_vendor_user:PASSWORD_1@HOST:5432/yu_arena_prod" \
  -c "SELECT COUNT(*) FROM drops;"

# Test readonly user (should work for SELECT)
psql "postgresql://yu_user_readonly:PASSWORD_2@HOST:5432/yu_arena_prod" \
  -c "SELECT COUNT(*) FROM drops;"

# Test readonly user cannot create drops (should fail)
psql "postgresql://yu_user_readonly:PASSWORD_2@HOST:5432/yu_arena_prod" \
  -c "INSERT INTO drops (id, operator_id) VALUES ('test', 'test');" 
# Expected: ERROR: permission denied
```

---

### PHASE 2: Environment Configuration (45 minutes)

#### Step 2.1: Create `.env.east` (Vendor Instance)

Create file: `.env.east`

```bash
# ============================================
# YU ARENA - VENDOR INSTANCE (US-EAST1)
# ============================================

# Instance Configuration
INSTANCE_TYPE=vendor
NODE_ENV=production
BASE_URL=https://yu-arena-381932264033.us-east1.run.app
PORT=8080

# User Instance URL (for claim links)
USER_INSTANCE_URL=https://yu-arena-381932264033.us-central1.run.app

# Database Configuration (Vendor User - Full Access)
DB_HOST=YOUR_CLOUD_SQL_HOST
DB_PORT=5432
DB_NAME=yu_arena_prod
DB_USER=yu_vendor_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_1
DB_SSL=true

# Authentication
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRY_SECONDS=86400
SESSION_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_STRING

# Twilio Configuration
TWILIO_ACCOUNT_SID=YOUR_TWILIO_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_TOKEN
TWILIO_WHATSAPP_FROM=+14155238886

# Feature Flags
ENABLE_VENDOR_FEATURES=true
ENABLE_PUBLIC_ACCESS=false
ENABLE_AUTHENTICATION=true
DEMO_AUTO_START=false

# Agent Configuration
AGENT_API_ENABLED=true
HAWK_API_KEY=yk_live_hawk_CHANGE_THIS_TO_RANDOM_STRING
ACE_API_KEY=yk_live_ace_CHANGE_THIS_TO_RANDOM_STRING

# Operational Settings
DROP_EXPIRY_SWEEP_MS=60000
LOG_LEVEL=info
ENABLE_METRICS=true

# Cloud Run Specific
CLOUD_RUN_REGION=us-east1
MIN_INSTANCES=1
MAX_INSTANCES=10
MEMORY=512Mi
CPU=1
```

#### Step 2.2: Create `.env.central` (User Instance)

Create file: `.env.central`

```bash
# ============================================
# YU ARENA - USER INSTANCE (US-CENTRAL1)
# ============================================

# Instance Configuration
INSTANCE_TYPE=user
NODE_ENV=production
BASE_URL=https://yu-arena-381932264033.us-central1.run.app
PORT=8080

# Vendor Instance URL (for admin operations)
VENDOR_INSTANCE_URL=https://yu-arena-381932264033.us-east1.run.app

# Database Configuration (Read-Only User)
DB_HOST=YOUR_CLOUD_SQL_HOST
DB_PORT=5432
DB_NAME=yu_arena_prod
DB_USER=yu_user_readonly
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_2
DB_SSL=true

# Twilio Configuration (for confirmations)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_TOKEN
TWILIO_WHATSAPP_FROM=+14155238886

# Feature Flags
ENABLE_VENDOR_FEATURES=false
ENABLE_PUBLIC_ACCESS=true
ENABLE_AUTHENTICATION=false
DEMO_AUTO_START=false

# Rate Limiting (protect public endpoints)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Operational Settings
LOG_LEVEL=info
ENABLE_METRICS=true

# Cloud Run Specific
CLOUD_RUN_REGION=us-central1
MIN_INSTANCES=0
MAX_INSTANCES=20
MEMORY=256Mi
CPU=0.5
```

#### Step 2.3: Generate Secrets

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32

# Generate agent API keys
echo "yk_live_hawk_$(openssl rand -hex 16)"
echo "yk_live_ace_$(openssl rand -hex 16)"
```

**Copy these into your `.env.east` and `.env.central` files.**

#### Step 2.4: Validate Environment Files

```bash
# Check all required vars are set
cat .env.east | grep "CHANGE_THIS"
# Should return nothing

cat .env.central | grep "CHANGE_THIS"
# Should return nothing
```

---

### PHASE 3: Code Changes (90 minutes)

#### Step 3.1: Create Instance Configuration Module

Create file: `server/src/config/instance.ts`

```typescript
/**
 * Instance Configuration
 * Determines which features are enabled based on INSTANCE_TYPE
 */

export const INSTANCE_TYPE = process.env.INSTANCE_TYPE || 'vendor';

export const isVendorInstance = (): boolean => {
  return INSTANCE_TYPE === 'vendor';
};

export const isUserInstance = (): boolean => {
  return INSTANCE_TYPE === 'user';
};

export const getBaseUrl = (): string => {
  return process.env.BASE_URL || 'http://localhost:8080';
};

export const getUserInstanceUrl = (): string => {
  return process.env.USER_INSTANCE_URL || 'http://localhost:3001';
};

export const getVendorInstanceUrl = (): string => {
  return process.env.VENDOR_INSTANCE_URL || 'http://localhost:8080';
};

export const features = {
  enableVendorFeatures: process.env.ENABLE_VENDOR_FEATURES === 'true',
  enablePublicAccess: process.env.ENABLE_PUBLIC_ACCESS === 'true',
  enableAuthentication: process.env.ENABLE_AUTHENTICATION !== 'false',
  enableAgentApi: process.env.AGENT_API_ENABLED === 'true',
  demoAutoStart: process.env.DEMO_AUTO_START === 'true',
};

export const config = {
  instance: INSTANCE_TYPE,
  baseUrl: getBaseUrl(),
  features,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    ssl: process.env.DB_SSL === 'true',
  },
};

// Log instance type on startup
console.log(`🚀 Starting YU Arena - Instance Type: ${INSTANCE_TYPE.toUpperCase()}`);
console.log(`📍 Base URL: ${getBaseUrl()}`);
console.log(`🔧 Features:`, features);
```

#### Step 3.2: Update Route Guards

Create file: `server/src/middleware/instanceGuard.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { isVendorInstance, isUserInstance, features } from '../config/instance';

/**
 * Middleware to ensure endpoint is only accessible on vendor instance
 */
export function requireVendorInstance(req: Request, res: Response, next: NextFunction) {
  if (!isVendorInstance()) {
    return res.status(404).json({
      error: 'Endpoint not available on this instance',
      instance: process.env.INSTANCE_TYPE,
      message: 'This endpoint is only available on the vendor instance'
    });
  }
  next();
}

/**
 * Middleware to ensure endpoint is only accessible on user instance
 */
export function requireUserInstance(req: Request, res: Response, next: NextFunction) {
  if (!isUserInstance()) {
    return res.status(404).json({
      error: 'Endpoint not available on this instance',
      instance: process.env.INSTANCE_TYPE,
      message: 'This endpoint is only available on the user instance'
    });
  }
  next();
}

/**
 * Middleware to require authentication only if enabled
 */
export function conditionalAuth(req: Request, res: Response, next: NextFunction) {
  if (!features.enableAuthentication) {
    // Skip auth on user instance
    return next();
  }
  
  // On vendor instance, require JWT
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token required' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### Step 3.3: Update Main Server File

Update `server/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import { config, features, isVendorInstance } from './config/instance';
import routes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests with instance info
app.use((req, res, next) => {
  console.log(`[${config.instance.toUpperCase()}] ${req.method} ${req.path}`);
  next();
});

// Health check (available on both instances)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    instance: config.instance,
    timestamp: new Date().toISOString(),
    features: features
  });
});

// API routes
app.use('/api', routes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('web/build'));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'web/build' });
  });
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Instance: ${config.instance}`);
  console.log(`🌐 Base URL: ${config.baseUrl}`);
});
```

#### Step 3.4: Update Routes File

Update `server/src/routes.ts`:

```typescript
import { Router } from 'express';
import { requireVendorInstance, conditionalAuth } from './middleware/instanceGuard';
import { features } from './config/instance';

const router = Router();

// ============================================
// VENDOR-ONLY ROUTES (US-EAST1)
// ============================================

// Authentication (vendor only)
if (features.enableVendorFeatures) {
  router.post('/auth/login', require('./handlers/auth').login);
  router.post('/auth/logout', conditionalAuth, require('./handlers/auth').logout);
  router.get('/auth/me', conditionalAuth, require('./handlers/auth').me);
  
  // Drop management (vendor only - full CRUD)
  router.post('/drops', requireVendorInstance, conditionalAuth, require('./handlers/drops').create);
  router.put('/drops/:id', requireVendorInstance, conditionalAuth, require('./handlers/drops').update);
  router.delete('/drops/:id', requireVendorInstance, conditionalAuth, require('./handlers/drops').remove);
  router.post('/drops/:id/launch', requireVendorInstance, conditionalAuth, require('./handlers/drops').launch);
  
  // Revenue tracking (vendor only)
  router.post('/revenue/recovered', requireVendorInstance, require('./handlers/revenue').recordRevenue);
  router.get('/revenue/summary', requireVendorInstance, conditionalAuth, require('./handlers/revenue').getSummary);
  
  // Metrics (vendor only)
  router.get('/metrics/investor', requireVendorInstance, conditionalAuth, require('./handlers/metrics').getInvestorMetrics);
  router.get('/metrics/liquidity', requireVendorInstance, conditionalAuth, require('./handlers/metrics').getLiquidity);
  router.get('/leaderboard', requireVendorInstance, conditionalAuth, require('./handlers/agents').getLeaderboard);
  
  // Agents (vendor only)
  router.post('/agents/register', requireVendorInstance, require('./handlers/agents').register);
  router.get('/agents/directory', requireVendorInstance, require('./handlers/agents').getDirectory);
}

// ============================================
// PUBLIC ROUTES (BOTH INSTANCES)
// ============================================

// Get active drops (read-only, available on both)
router.get('/drops/active', require('./handlers/drops').getActive);
router.get('/drops/:id', require('./handlers/drops').getOne);

// Claim flow (primary on Central, but works on both)
router.post('/drops/:id/claim', require('./handlers/claims').createClaim);

export default router;
```

#### Step 3.5: Update Claim Link Generation

Update `server/src/utils/claimLinks.ts`:

```typescript
import { getUserInstanceUrl } from '../config/instance';

/**
 * Generate claim link pointing to USER instance
 * IMPORTANT: Always points to Central (us-central1) even when called from East
 */
export function generateClaimLink(dropId: string): string {
  const userBaseUrl = getUserInstanceUrl();
  return `${userBaseUrl}/c/${dropId}`;
}

/**
 * Generate claim link for WhatsApp (short version)
 */
export function generateWhatsAppClaimLink(dropId: string): string {
  return generateClaimLink(dropId);
}

/**
 * Example usage in WhatsApp handler
 */
export function formatWhatsAppMessage(drop: any): string {
  const claimLink = generateClaimLink(drop.id);
  
  return `
🏋️ New spot available!

${drop.offering_name}
${drop.venue}
${formatTime(drop.scheduled_time)}

💰 $${drop.price} (was $${drop.original_price})

👉 Claim now: ${claimLink}
`.trim();
}
```

#### Step 3.6: Update Frontend Routing

Create `web/src/config/instance.ts`:

```typescript
export const INSTANCE_TYPE = process.env.REACT_APP_INSTANCE_TYPE || 'vendor';

export const isVendorInstance = () => INSTANCE_TYPE === 'vendor';
export const isUserInstance = () => INSTANCE_TYPE === 'user';

export const config = {
  instance: INSTANCE_TYPE,
  apiUrl: process.env.REACT_APP_API_URL || window.location.origin,
};

console.log('Frontend Instance:', INSTANCE_TYPE);
```

Update `web/src/App.tsx`:

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isVendorInstance, isUserInstance } from './config/instance';

// Vendor components
import LoginPage from './pages/vendor/LoginPage';
import OperatorDashboard from './pages/vendor/OperatorDashboard';
import CreateDrop from './pages/vendor/CreateDrop';
import Results from './pages/vendor/Results';
import Investors from './pages/vendor/Investors';
import Settings from './pages/vendor/Settings';

// User components
import PublicHomepage from './pages/user/PublicHomepage';
import ArenaView from './pages/user/ArenaView';
import ClaimFlow from './pages/user/ClaimFlow';

function App() {
  return (
    <Router>
      <Routes>
        {/* VENDOR INSTANCE ROUTES (US-EAST1) */}
        {isVendorInstance() && (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/operator/drop/new" element={<CreateDrop />} />
            <Route path="/operator/results" element={<Results />} />
            <Route path="/operator/investors" element={<Investors />} />
            <Route path="/operator/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* USER INSTANCE ROUTES (US-CENTRAL1) */}
        {isUserInstance() && (
          <>
            <Route path="/" element={<PublicHomepage />} />
            <Route path="/arena" element={<ArenaView />} />
            <Route path="/claim/:dropId" element={<ClaimFlow />} />
            <Route path="/c/:dropId" element={<ClaimFlow />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
```

---

### PHASE 4: Build Configuration (30 minutes)

#### Step 4.1: Update package.json Scripts

Update `package.json`:

```json
{
  "name": "yu-arena",
  "version": "2.0.0",
  "scripts": {
    "dev:vendor": "INSTANCE_TYPE=vendor REACT_APP_INSTANCE_TYPE=vendor npm run dev",
    "dev:user": "INSTANCE_TYPE=user REACT_APP_INSTANCE_TYPE=user npm run dev",
    "build:vendor": "INSTANCE_TYPE=vendor REACT_APP_INSTANCE_TYPE=vendor npm run build:all",
    "build:user": "INSTANCE_TYPE=user REACT_APP_INSTANCE_TYPE=user npm run build:all",
    "build:all": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd web && npm run build",
    "build:backend": "cd server && npm run build",
    "deploy:vendor": "npm run build:vendor && ./scripts/deploy-vendor.sh",
    "deploy:user": "npm run build:user && ./scripts/deploy-user.sh",
    "deploy:both": "npm run deploy:vendor && npm run deploy:user"
  }
}
```

#### Step 4.2: Create Deployment Scripts

Create `scripts/deploy-vendor.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying YU Arena - VENDOR INSTANCE (US-EAST1)"
echo "=================================================="

# Load environment variables
export $(cat .env.east | grep -v '^#' | xargs)

# Build the application
echo "📦 Building vendor instance..."
npm run build:vendor

# Deploy to Cloud Run
echo "☁️  Deploying to us-east1..."
gcloud run deploy yu-arena-vendor \
  --source . \
  --region us-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env.east | grep -v '^#' | grep -v '^$' | xargs | tr ' ' ',')" \
  --min-instances=${MIN_INSTANCES:-1} \
  --max-instances=${MAX_INSTANCES:-10} \
  --memory=${MEMORY:-512Mi} \
  --cpu=${CPU:-1} \
  --timeout=300 \
  --service-account=yu-arena@PROJECT_ID.iam.gserviceaccount.com

echo "✅ Vendor instance deployed successfully!"
echo "🌐 URL: https://yu-arena-381932264033.us-east1.run.app"
```

Create `scripts/deploy-user.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying YU Arena - USER INSTANCE (US-CENTRAL1)"
echo "==================================================="

# Load environment variables
export $(cat .env.central | grep -v '^#' | xargs)

# Build the application
echo "📦 Building user instance..."
npm run build:user

# Deploy to Cloud Run
echo "☁️  Deploying to us-central1..."
gcloud run deploy yu-arena-user \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="$(cat .env.central | grep -v '^#' | grep -v '^$' | xargs | tr ' ' ',')" \
  --min-instances=${MIN_INSTANCES:-0} \
  --max-instances=${MAX_INSTANCES:-20} \
  --memory=${MEMORY:-256Mi} \
  --cpu=${CPU:-0.5} \
  --cpu-throttling \
  --concurrency=80 \
  --timeout=60 \
  --service-account=yu-arena@PROJECT_ID.iam.gserviceaccount.com

echo "✅ User instance deployed successfully!"
echo "🌐 URL: https://yu-arena-381932264033.us-central1.run.app"
```

Make scripts executable:
```bash
chmod +x scripts/deploy-vendor.sh
chmod +x scripts/deploy-user.sh
```

---

### PHASE 5: Deploy Both Instances (45 minutes)

#### Step 5.1: Deploy Vendor Instance (East)

```bash
# Run deployment
npm run deploy:vendor

# Wait for deployment to complete (2-3 minutes)

# Verify deployment
curl https://yu-arena-381932264033.us-east1.run.app/api/health

# Expected response:
# {
#   "status": "healthy",
#   "instance": "vendor",
#   "timestamp": "2024-02-25T...",
#   "features": {
#     "enableVendorFeatures": true,
#     "enablePublicAccess": false,
#     ...
#   }
# }
```

#### Step 5.2: Deploy User Instance (Central)

```bash
# Run deployment
npm run deploy:user

# Wait for deployment to complete (2-3 minutes)

# Verify deployment
curl https://yu-arena-381932264033.us-central1.run.app/api/health

# Expected response:
# {
#   "status": "healthy",
#   "instance": "user",
#   "timestamp": "2024-02-25T...",
#   "features": {
#     "enableVendorFeatures": false,
#     "enablePublicAccess": true,
#     ...
#   }
# }
```

#### Step 5.3: Verify Both Instances

```bash
# Test vendor authentication (should work)
curl -X POST https://yu-arena-381932264033.us-east1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@test.com","password":"password123"}'

# Test user instance authentication (should return 404)
curl -X POST https://yu-arena-381932264033.us-central1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@test.com","password":"password123"}'

# Test public drops endpoint (should work on both)
curl https://yu-arena-381932264033.us-east1.run.app/api/drops/active
curl https://yu-arena-381932264033.us-central1.run.app/api/drops/active
```

---

### PHASE 6: Configure Agents (30 minutes)

#### Step 6.1: Update Agent Configuration

Create `agents/.env`:

```bash
# Agent Configuration - Points to VENDOR instance
VENDOR_API_URL=https://yu-arena-381932264033.us-east1.run.app
HAWK_API_KEY=yk_live_hawk_YOUR_KEY_FROM_ENV_EAST
ACE_API_KEY=yk_live_ace_YOUR_KEY_FROM_ENV_EAST

# Database (for direct access)
DB_HOST=YOUR_CLOUD_SQL_HOST
DB_PORT=5432
DB_NAME=yu_arena_prod
DB_USER=yu_agent_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_3
DB_SSL=true
```

#### Step 6.2: Update Agent Startup Script

Create `agents/run-agents.sh`:

```bash
#!/bin/bash
set -e

echo "🤖 Starting YU Arena Agents"
echo "============================"

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "🔍 HAWK connecting to: $VENDOR_API_URL"
echo "🎯 ACE connecting to: $VENDOR_API_URL"

# Start HAWK in background
cd hawk
node index.js > ../logs/hawk.log 2>&1 &
HAWK_PID=$!
echo "✅ HAWK started (PID: $HAWK_PID)"
cd ..

# Start ACE in background
cd ace
node index.js > ../logs/ace.log 2>&1 &
ACE_PID=$!
echo "✅ ACE started (PID: $ACE_PID)"
cd ..

echo ""
echo "📊 Agents running:"
echo "   HAWK: PID $HAWK_PID"
echo "   ACE:  PID $ACE_PID"
echo ""
echo "📝 Logs:"
echo "   tail -f agents/logs/hawk.log"
echo "   tail -f agents/logs/ace.log"
echo ""
echo "🛑 To stop: kill $HAWK_PID $ACE_PID"

# Keep script running
wait
```

Make executable:
```bash
chmod +x agents/run-agents.sh
```

#### Step 6.3: Start Agents

```bash
cd agents
./run-agents.sh
```

Verify agents are running:
```bash
# Check logs
tail -f agents/logs/hawk.log
tail -f agents/logs/ace.log

# Should see connection confirmations
```

---

## DAY 2: TESTING & VALIDATION

### PHASE 7: End-to-End Testing (90 minutes)

#### Test 7.1: Vendor Login Flow

```bash
# Test vendor login
curl -X POST https://yu-arena-381932264033.us-east1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@barrys.com",
    "password": "your_password"
  }'

# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Verify token works
curl https://yu-arena-381932264033.us-east1.run.app/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Test 7.2: Drop Creation (Vendor)

```bash
# Create a drop
curl -X POST https://yu-arena-381932264033.us-east1.run.app/api/drops \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offering_name": "6pm HIIT Circuit",
    "scheduled_time": "2024-02-26T18:00:00Z",
    "price": 35.00,
    "original_price": 45.00,
    "capacity": 1
  }'

# Save drop ID from response
DROP_ID="drop_abc123"
```

#### Test 7.3: Drop Visibility (User)

```bash
# Wait 10 seconds for database propagation
sleep 10

# Check drop appears on user instance
curl https://yu-arena-381932264033.us-central1.run.app/api/drops/active

# Should see the drop you just created
```

#### Test 7.4: Claim Flow (User)

```bash
# Claim the drop
curl -X POST https://yu-arena-381932264033.us-central1.run.app/api/drops/$DROP_ID/claim \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+14155551234",
    "email": "john@example.com"
  }'

# Should get success response with claim ID
```

#### Test 7.5: Verify Claim (Vendor)

```bash
# Check claim appears in vendor dashboard
curl https://yu-arena-381932264033.us-east1.run.app/api/drops/$DROP_ID \
  -H "Authorization: Bearer $TOKEN"

# Should show claim data
```

#### Test 7.6: Revenue Recording (Agent/Vendor)

```bash
# Record revenue
curl -X POST https://yu-arena-381932264033.us-east1.run.app/api/revenue/recovered \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "drop_id": "'$DROP_ID'",
    "amount": 35.00,
    "agent_id": "ACE_001"
  }'

# Should get success confirmation
```

---

### PHASE 8: Browser Testing (60 minutes)

#### Test 8.1: Vendor Interface (East)

Open browser to: `https://yu-arena-381932264033.us-east1.run.app`

**Test Checklist**:
- [ ] Login page loads
- [ ] Can login with credentials
- [ ] Redirected to operator dashboard
- [ ] Can navigate to "Create Drop"
- [ ] Can create a new drop
- [ ] Drop appears in results page
- [ ] Investor dashboard shows metrics
- [ ] Settings page loads

#### Test 8.2: User Interface (Central)

Open browser to: `https://yu-arena-381932264033.us-central1.run.app`

**Test Checklist**:
- [ ] Homepage loads without login
- [ ] Can see list of active drops
- [ ] Can click on a drop to claim
- [ ] Claim form appears (name, phone, email)
- [ ] Can submit claim
- [ ] Confirmation message appears
- [ ] No authentication required anywhere

#### Test 8.3: Cross-Instance Flow

**Full Flow Test**:
1. Login to vendor (East) ✓
2. Create drop ✓
3. Open user (Central) in incognito window ✓
4. See drop appear ✓
5. Claim drop as user ✓
6. Refresh vendor dashboard ✓
7. See claim appear ✓

---

### PHASE 9: Agent Testing (30 minutes)

#### Test 9.1: HAWK Detection

```bash
# Simulate cancellation in database
psql "postgresql://..." -c "
  UPDATE schedule_blocks 
  SET status = 'cancelled' 
  WHERE id = 'block_test_123'
"

# Check HAWK logs
tail -f agents/logs/hawk.log

# Should see: "Detected cancellation: block_test_123"
# Should see: "Created drop: drop_xyz"
```

#### Test 9.2: ACE Claim Confirmation

```bash
# Create a claim manually
curl -X POST https://yu-arena-381932264033.us-central1.run.app/api/drops/$DROP_ID/claim \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+14155551234"}'

# Check ACE logs
tail -f agents/logs/ace.log

# Should see: "Claim detected: claim_abc"
# Should see: "Confirming claim..."
# Should see: "Revenue recorded: $35.00"
```

---

### PHASE 10: Performance Testing (15 minutes)

#### Test 10.1: Response Times

```bash
# Test vendor API response time
time curl https://yu-arena-381932264033.us-east1.run.app/api/drops/active

# Should be < 500ms

# Test user API response time
time curl https://yu-arena-381932264033.us-central1.run.app/api/drops/active

# Should be < 300ms
```

#### Test 10.2: Concurrent Requests

```bash
# Test with Apache Bench (if installed)
ab -n 100 -c 10 https://yu-arena-381932264033.us-central1.run.app/api/drops/active

# Or use hey
hey -n 100 -c 10 https://yu-arena-381932264033.us-central1.run.app/api/drops/active
```

---

### PHASE 11: HW3 Validation (30 minutes)

#### HW3 Requirement 1: 6+ Agents

```bash
# Register 6 agents via vendor instance
for i in {1..6}; do
  curl -X POST https://yu-arena-381932264033.us-east1.run.app/api/agents/register \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Agent_$i\",
      \"type\": \"ACE\",
      \"email\": \"agent$i@test.com\"
    }"
done

# Verify agent count
curl https://yu-arena-381932264033.us-east1.run.app/api/agents/directory \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

# Should show 6+
```

#### HW3 Requirement 2: Two Use Cases

**Use Case 1: Revenue Recovery League**
- [ ] Leaderboard visible at `/operator/results`
- [ ] Shows agent rankings
- [ ] Updates when revenue recorded

**Use Case 2: Supply-Demand Matchmaking**
- [ ] Drops visible on user instance
- [ ] Users can claim without auth
- [ ] Marketplace flow works end-to-end

#### HW3 Requirement 3: Product Improvements

- [ ] **Onboarding**: Agent registration works (`/api/agents/register`)
- [ ] **Agent Directory**: Visible at `/operator/agents` or `/api/agents/directory`
- [ ] **Observability**: Activity logs visible, metrics dashboard working
- [ ] **Structured Docs**: SKILL.md accessible and detailed
- [ ] **Rate Limiting**: Implemented on user instance (check headers)

---

## COMPLETE CODE FILES

### File: `server/src/handlers/drops.ts`

```typescript
import { Request, Response } from 'express';
import { Pool } from 'pg';
import { generateClaimLink } from '../utils/claimLinks';
import { isVendorInstance } from '../config/instance';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Create new drop (Vendor only)
 */
export async function create(req: Request, res: Response) {
  try {
    const { offering_name, scheduled_time, price, original_price, capacity } = req.body;
    const operatorId = req.user.operatorId; // From JWT

    const result = await pool.query(
      `INSERT INTO drops (id, operator_id, offering_name, scheduled_time, price, original_price, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [`drop_${Date.now()}`, operatorId, offering_name, scheduled_time, price, original_price, capacity]
    );

    const drop = result.rows[0];
    const claimLink = generateClaimLink(drop.id);

    res.json({
      success: true,
      drop: {
        ...drop,
        claim_link: claimLink
      }
    });
  } catch (error) {
    console.error('Error creating drop:', error);
    res.status(500).json({ error: 'Failed to create drop' });
  }
}

/**
 * Get active drops (Both instances)
 */
export async function getActive(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT d.*, o.name as operator_name, o.venue
       FROM drops d
       JOIN operators o ON d.operator_id = o.id
       WHERE d.status = 'active'
       AND d.scheduled_time > NOW()
       ORDER BY d.scheduled_time ASC
       LIMIT 50`
    );

    // Add claim links
    const drops = result.rows.map(drop => ({
      ...drop,
      claim_link: generateClaimLink(drop.id)
    }));

    res.json(drops);
  } catch (error) {
    console.error('Error getting active drops:', error);
    res.status(500).json({ error: 'Failed to get drops' });
  }
}

/**
 * Get single drop (Both instances)
 */
export async function getOne(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.*, o.name as operator_name, o.venue, o.address
       FROM drops d
       JOIN operators o ON d.operator_id = o.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    const drop = result.rows[0];

    // Get claims if vendor instance
    if (isVendorInstance()) {
      const claimsResult = await pool.query(
        `SELECT * FROM claims WHERE drop_id = $1 ORDER BY claimed_at DESC`,
        [id]
      );
      drop.claims = claimsResult.rows;
    }

    res.json({
      ...drop,
      claim_link: generateClaimLink(drop.id)
    });
  } catch (error) {
    console.error('Error getting drop:', error);
    res.status(500).json({ error: 'Failed to get drop' });
  }
}

/**
 * Launch drop (Vendor only)
 */
export async function launch(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE drops SET status = 'active' WHERE id = $1`,
      [id]
    );

    res.json({ success: true, message: 'Drop launched' });
  } catch (error) {
    console.error('Error launching drop:', error);
    res.status(500).json({ error: 'Failed to launch drop' });
  }
}

/**
 * Update drop (Vendor only)
 */
export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await pool.query(
      `UPDATE drops SET 
        offering_name = COALESCE($1, offering_name),
        scheduled_time = COALESCE($2, scheduled_time),
        price = COALESCE($3, price),
        capacity = COALESCE($4, capacity)
       WHERE id = $5
       RETURNING *`,
      [updates.offering_name, updates.scheduled_time, updates.price, updates.capacity, id]
    );

    res.json({ success: true, drop: result.rows[0] });
  } catch (error) {
    console.error('Error updating drop:', error);
    res.status(500).json({ error: 'Failed to update drop' });
  }
}

/**
 * Delete drop (Vendor only)
 */
export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE drops SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    res.json({ success: true, message: 'Drop cancelled' });
  } catch (error) {
    console.error('Error deleting drop:', error);
    res.status(500).json({ error: 'Failed to delete drop' });
  }
}
```

### File: `server/src/handlers/claims.ts`

```typescript
import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * Create claim (Both instances, primarily Central)
 */
export async function createClaim(req: Request, res: Response) {
  try {
    const { id: dropId } = req.params;
    const { name, phone, email } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check drop exists and is claimable
    const dropResult = await pool.query(
      `SELECT * FROM drops WHERE id = $1 AND status = 'active'`,
      [dropId]
    );

    if (dropResult.rows.length === 0) {
      return res.status(404).json({ error: 'Drop not found or not available' });
    }

    const drop = dropResult.rows[0];

    // Check capacity
    const claimCountResult = await pool.query(
      `SELECT COUNT(*) FROM claims WHERE drop_id = $1 AND status != 'cancelled'`,
      [dropId]
    );

    const claimCount = parseInt(claimCountResult.rows[0].count);
    if (claimCount >= drop.capacity) {
      return res.status(400).json({ error: 'Drop is full' });
    }

    // Create claim
    const claimResult = await pool.query(
      `INSERT INTO claims (id, drop_id, claimant_name, claimant_phone, claimant_email, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [`claim_${Date.now()}`, dropId, name, phone, email]
    );

    const claim = claimResult.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO operator_events (id, operator_id, event_type, drop_id, metadata)
       VALUES ($1, $2, 'claim_received', $3, $4)`,
      [
        `event_${Date.now()}`,
        drop.operator_id,
        dropId,
        JSON.stringify({ claim_id: claim.id, claimant: name })
      ]
    );

    res.json({
      success: true,
      claim_id: claim.id,
      drop: {
        offering_name: drop.offering_name,
        scheduled_time: drop.scheduled_time,
        venue: drop.venue
      },
      message: 'Claim submitted successfully! You will receive confirmation shortly.'
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
}
```

---

## DEPLOYMENT SCRIPTS

### Script: `scripts/quick-deploy-both.sh`

```bash
#!/bin/bash
set -e

echo "🚀 YU Arena - Deploy Both Instances"
echo "===================================="
echo ""

# Check prerequisites
if [ ! -f .env.east ]; then
  echo "❌ Error: .env.east not found"
  exit 1
fi

if [ ! -f .env.central ]; then
  echo "❌ Error: .env.central not found"
  exit 1
fi

# Deploy vendor first
echo "1️⃣  Deploying VENDOR instance (us-east1)..."
./scripts/deploy-vendor.sh

echo ""
echo "⏳ Waiting 30 seconds before deploying user instance..."
sleep 30

# Deploy user second
echo "2️⃣  Deploying USER instance (us-central1)..."
./scripts/deploy-user.sh

echo ""
echo "✅ Both instances deployed successfully!"
echo ""
echo "🔗 URLs:"
echo "   Vendor: https://yu-arena-381932264033.us-east1.run.app"
echo "   User:   https://yu-arena-381932264033.us-central1.run.app"
echo ""
echo "🧪 Next steps:"
echo "   1. Test health endpoints"
echo "   2. Verify authentication"
echo "   3. Test end-to-end flow"
echo "   4. Start agents"
```

Make executable:
```bash
chmod +x scripts/quick-deploy-both.sh
```

---

## TESTING SCRIPTS

### Script: `scripts/test-e2e.sh`

```bash
#!/bin/bash
set -e

echo "🧪 YU Arena - End-to-End Test Suite"
echo "===================================="

VENDOR_URL="https://yu-arena-381932264033.us-east1.run.app"
USER_URL="https://yu-arena-381932264033.us-central1.run.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

passed=0
failed=0

function test_endpoint() {
  local name=$1
  local url=$2
  local expected=$3
  
  echo -n "Testing: $name... "
  
  response=$(curl -s -w "%{http_code}" -o /dev/null $url)
  
  if [ "$response" -eq "$expected" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((passed++))
  else
    echo -e "${RED}✗ FAIL${NC} (expected $expected, got $response)"
    ((failed++))
  fi
}

echo ""
echo "📊 Health Checks"
echo "----------------"
test_endpoint "Vendor health" "$VENDOR_URL/api/health" 200
test_endpoint "User health" "$USER_URL/api/health" 200

echo ""
echo "🔒 Authentication"
echo "-----------------"
test_endpoint "Vendor login endpoint exists" "$VENDOR_URL/api/auth/login" 400
test_endpoint "User login endpoint blocked" "$USER_URL/api/auth/login" 404

echo ""
echo "📦 Drops API"
echo "------------"
test_endpoint "Vendor active drops" "$VENDOR_URL/api/drops/active" 200
test_endpoint "User active drops" "$USER_URL/api/drops/active" 200

echo ""
echo "🎯 Vendor-Only Endpoints"
echo "------------------------"
test_endpoint "Vendor metrics accessible" "$VENDOR_URL/api/metrics/investor" 401
test_endpoint "User metrics blocked" "$USER_URL/api/metrics/investor" 404

echo ""
echo "📋 Summary"
echo "----------"
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"

if [ $failed -eq 0 ]; then
  echo -e "\n${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed${NC}"
  exit 1
fi
```

Make executable:
```bash
chmod +x scripts/test-e2e.sh
```

Run tests:
```bash
./scripts/test-e2e.sh
```

---

## TROUBLESHOOTING GUIDE

### Issue 1: Environment Variables Not Loading

**Symptoms**:
- Service returns 500 errors
- Logs show "undefined" for env vars

**Solution**:
```bash
# Verify env vars are set in Cloud Run
gcloud run services describe yu-arena-vendor --region us-east1 --format="value(spec.template.spec.containers[0].env)"

# If missing, redeploy with explicit env vars
gcloud run services update yu-arena-vendor \
  --region us-east1 \
  --set-env-vars="$(cat .env.east | grep -v '^#' | xargs | tr ' ' ',')"
```

### Issue 2: Database Connection Fails

**Symptoms**:
- Errors: "connection refused"
- Errors: "authentication failed"

**Solution**:
```bash
# Test connection from Cloud Run
gcloud run services describe yu-arena-vendor --region us-east1

# Check Cloud SQL connection
gcloud sql instances describe yu-arena-db

# Verify service account has Cloud SQL Client role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:yu-arena@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

### Issue 3: Claims Not Appearing in Vendor Dashboard

**Symptoms**:
- User can claim successfully
- Vendor doesn't see claims

**Solution**:
```bash
# Check database directly
psql "postgresql://..." -c "SELECT * FROM claims ORDER BY claimed_at DESC LIMIT 5;"

# Verify both instances use same database
# Check DB_HOST in both .env.east and .env.central

# Clear cache on vendor instance
curl -X POST $VENDOR_URL/api/cache/clear \
  -H "Authorization: Bearer $TOKEN"
```

### Issue 4: Agents Can't Connect

**Symptoms**:
- Agent logs show connection errors
- No drops being created

**Solution**:
```bash
# Verify agent env vars
cat agents/.env

# Test agent API key
curl $VENDOR_URL/api/health \
  -H "Authorization: Bearer $HAWK_API_KEY"

# Check agent logs
tail -f agents/logs/hawk.log
tail -f agents/logs/ace.log
```

### Issue 5: Slow Response Times

**Symptoms**:
- API calls take > 2 seconds
- Pages load slowly

**Solution**:
```bash
# Check instance is warmed up
# Vendor should have min_instances=1

# Increase resources if needed
gcloud run services update yu-arena-vendor \
  --region us-east1 \
  --memory=1Gi \
  --cpu=2

# Check database connection pooling
# Ensure pool size is appropriate (default 10)
```

---

## HW3 SUBMISSION CHECKLIST

### Before Submitting

- [ ] **Both instances deployed and accessible**
  - Vendor: https://yu-arena-381932264033.us-east1.run.app
  - User: https://yu-arena-381932264033.us-central1.run.app

- [ ] **6+ agents registered**
  - Verify: `curl $VENDOR_URL/api/agents/directory -H "Authorization: Bearer $TOKEN"`

- [ ] **Two use cases demonstrated**
  - Revenue Recovery League visible at `/operator/results`
  - Supply-Demand Matchmaking working on user instance

- [ ] **Product improvements visible**
  - Agent registration works
  - Agent directory accessible
  - Metrics dashboard showing data
  - SKILL.md documented
  - Rate limiting implemented

- [ ] **End-to-end flow tested**
  - Can create drop on vendor
  - Drop appears on user instance
  - User can claim without auth
  - Claim appears in vendor dashboard
  - Revenue gets recorded

### Screenshots to Include

1. **Vendor Dashboard** (East)
   - Login page
   - Operator dashboard with metrics
   - Create drop form
   - Results/leaderboard page
   - Investor dashboard

2. **User Experience** (Central)
   - Homepage with drops
   - Claim flow (before/after)
   - Confirmation screen

3. **Architecture Evidence**
   - Both health endpoints showing different instance types
   - Agent directory showing 6+ agents
   - Database showing shared data

4. **Network Effects**
   - Fill rate metrics
   - Time-to-fill chart
   - Revenue recovered totals

### Video Demo Script (3 minutes)

**Minute 1: Architecture Overview**
- Show both URLs
- Explain vendor vs user separation
- Show health endpoints proving instance types

**Minute 2: Vendor Flow**
- Login to vendor instance
- Create a drop
- Show it in results

**Minute 3: User Flow**
- Open user instance (incognito)
- Show drop appears
- Claim the drop
- Show confirmation
- Back to vendor - show claim appeared

### Documentation to Submit

1. **Architecture Diagram** (provided in guide)
2. **Environment Variables** (sanitized - no real passwords)
3. **Deployment Process** (copy from this guide)
4. **Testing Results** (output from test scripts)
5. **Agent Configuration** (sanitized)

---

## FINAL DEPLOYMENT COMMAND

When ready to deploy everything:

```bash
# Make sure you're in project root
cd /path/to/YU-Arena-V2

# Run full deployment
./scripts/quick-deploy-both.sh

# Run tests
./scripts/test-e2e.sh

# Start agents
cd agents && ./run-agents.sh

# Monitor everything
watch -n 5 'curl -s https://yu-arena-381932264033.us-east1.run.app/api/health && echo "" && curl -s https://yu-arena-381932264033.us-central1.run.app/api/health'
```

---

## SUCCESS CRITERIA

You'll know Option B is working when:

✅ Vendor URL shows login page
✅ User URL shows browse page (no login)
✅ Health endpoints return different instance types
✅ Can create drop on vendor
✅ Drop appears on user within 10 seconds
✅ User can claim without authentication
✅ Claim appears in vendor dashboard
✅ Agents connect to vendor instance only
✅ Revenue tracking works end-to-end
✅ All HW3 requirements met

---

## NEED HELP?

### Quick Debug Commands

```bash
# Check deployment status
gcloud run services list --region us-east1
gcloud run services list --region us-central1

# View logs
gcloud run logs tail yu-arena-vendor --region us-east1
gcloud run logs tail yu-arena-user --region us-central1

# Test specific endpoints
curl $VENDOR_URL/api/health
curl $USER_URL/api/health

# Check database
psql "postgresql://..." -c "SELECT COUNT(*) FROM drops;"
psql "postgresql://..." -c "SELECT COUNT(*) FROM claims;"
```

### Emergency Rollback

If something goes wrong:

```bash
# Revert to previous revision
gcloud run services update-traffic yu-arena-vendor \
  --region us-east1 \
  --to-revisions PREVIOUS_REVISION=100

# Or delete and start over
gcloud run services delete yu-arena-vendor --region us-east1
gcloud run services delete yu-arena-user --region us-central1

# Redeploy Option A (single instance)
git checkout main
npm run build
gcloud run deploy yu-arena --source . --region us-east1
```

---

## ESTIMATED TIMELINE

**Total Time: 6-8 hours over 2 days**

**Day 1** (4-6 hours):
- Phase 1: Database setup (30 min)
- Phase 2: Environment config (45 min)
- Phase 3: Code changes (90 min)
- Phase 4: Build config (30 min)
- Phase 5: Deploy both (45 min)
- Phase 6: Configure agents (30 min)

**Day 2** (2-3 hours):
- Phase 7: E2E testing (90 min)
- Phase 8: Browser testing (60 min)
- Phase 9: Agent testing (30 min)
- Phase 10: Performance (15 min)
- Phase 11: HW3 validation (30 min)

---

## YOU'RE READY!

This guide contains everything you need to implement Option B successfully. Follow the phases in order, test thoroughly, and you'll have a professional dual-deployment architecture ready for HW3 and VC demos.

**Good luck! 🚀**

Need clarification on any step? Ask before proceeding.
