# Phase 27 — Hostinger VPS Migration Preparation

**Date:** 2026-03-21
**Phase:** 27
**Type:** PLANNING / DOCUMENTATION — Migration blueprint (no code changes, no infrastructure changes)
**Author:** Claude Code (Remediation Agent)
**Preceding:** Phase 26C (docs/Phase-26C-Chair-Timestamp-Hardening-Report.md)

---

## 1. Overview

All application code blockers are resolved through Phase 26C. The system is now architecturally ready to run on a VPS. This document is the authoritative migration blueprint for moving RVM-AMS from Lovable-hosted frontend to Hostinger VPS.

**Current state:**
- Domain: `rvmflow.com` (DNS currently points to Lovable)
- Frontend: React + Vite SPA (static build output)
- Backend: Supabase (cloud-hosted, external — remains unchanged)

**Target state:**
- Frontend: `dist/` static files served by nginx on Hostinger VPS
- Backend: Supabase (cloud-hosted, unchanged)
- Domain: `rvmflow.com` DNS A record pointing to VPS IPv4
- SSL: Let's Encrypt via certbot

**This document does NOT execute the migration.** It defines the exact steps, configs, and verification criteria so that migration can be performed safely with a clear rollback path.

---

## 2. Architecture Decision

### Option A — Static files served by nginx (RECOMMENDED)

**How it works:** `npm run build` produces a `dist/` folder containing static HTML, JavaScript (content-hashed), and CSS. nginx serves these files directly and uses `try_files $uri $uri/ /index.html` to handle React Router's client-side routing.

| Property | Option A (Static + nginx) | Option B (Node.js runtime) |
|----------|--------------------------|---------------------------|
| Fit for Vite SPA | Perfect | Over-engineered |
| Runtime process | None after build | Node.js process must stay alive |
| PM2/systemd needed? | **No** | Yes |
| Operational complexity | Low | Medium |
| Security surface | Minimal — only nginx:443 exposed | Larger — Node.js port also exposed |
| Memory footprint | ~50 MB (nginx) | ~150–300 MB (Node.js) |
| Maintenance | Zero — static files do not crash | Process restarts must be managed |
| Can serve 10–50 users? | Yes, trivially | Yes, with overhead |

**Decision: Option A**

Rationale: This stack has no server-side rendering, no API endpoints, and no backend workers on the frontend host. The Supabase backend is entirely external (cloud). There is no application server to maintain. nginx + static files is the correct, minimal, and most secure deployment model for this codebase.

**PM2 is not required and should not be installed.** nginx is managed by Ubuntu systemd and restarts automatically on server reboot. Static files do not crash.

---

## 3. VPS Spec Recommendation

**Target audience:** 10–50 internal government users. Supabase remains external. No backend workers currently.

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 1 vCPU | 1–2 vCPU |
| RAM | 2 GB | **4 GB** |
| Storage | 20 GB SSD | 40–50 GB SSD |
| Bandwidth | 1 TB/month | 1–2 TB/month |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

**Why 4 GB RAM:** The application itself at runtime uses ~50 MB (nginx + OS). However, the build process (`npm run build`) runs Node.js + TypeScript compilation and peaks at ~1.5–2 GB RAM. A 2 GB VPS can fail during builds if the OS is otherwise active. 4 GB provides safe headroom.

**Hostinger plan mapping:**
- **KVM 1** (1 vCPU, 4 GB RAM, 50 GB SSD, 4 TB bandwidth) — acceptable if builds are done manually one at a time with no other load
- **KVM 2** (2 vCPU, 8 GB RAM, 100 GB SSD, 8 TB bandwidth) — **recommended** as the conservative safe choice

**Upgrade path:** If usage grows beyond 50 users or backend workers are added (e.g., cron jobs, Supabase Edge Function proxy, scheduled reports), upgrade to KVM 4 (4 vCPU, 16 GB RAM). No architectural changes are needed — nginx + static files scales linearly with hardware.

---

## 4. Required VPS Components

| Component | Status | Purpose |
|-----------|--------|---------|
| Ubuntu 22.04 LTS | **REQUIRED** | OS — LTS provides security support through April 2027 |
| nginx | **REQUIRED** | Serves `dist/` static files + SPA routing + HTTPS termination |
| Node.js v20 LTS + npm | **REQUIRED** (build only) | Used during `npm install` + `npm run build`. NOT a runtime process after build. |
| certbot (Let's Encrypt) | **REQUIRED** | Free SSL/TLS certificate issuance and auto-renewal |
| ufw (firewall) | **REQUIRED** | Allow ports 22, 80, 443 only. Block all other inbound. |
| git | **REQUIRED** | Pull repository for deployment |
| PM2 | **NOT REQUIRED** | No persistent Node.js process. Static files do not crash. |
| systemd service for app | **NOT REQUIRED** | nginx is already managed by systemd |
| Docker / Docker Compose | NOT REQUIRED | Over-engineered for static file serving |
| nvm (Node version manager) | OPTIONAL | Convenient for Node.js version pinning; not strictly required |

---

## 5. SPA Routing Plan

### The Problem

React Router uses `BrowserRouter` (HTML5 history API). This means:
- Navigation within the app works via JavaScript — no server requests
- But if a user navigates directly to `https://rvmflow.com/rvm/dossiers` or presses **browser refresh**, the browser sends a request to nginx for the path `/rvm/dossiers`
- nginx finds no file at that path in `dist/` → returns **404**

### The Solution

nginx must return `index.html` for any path that does not match an actual static file. React Router's JavaScript bundle then handles the routing client-side.

**Confirmed from codebase:**
- `basePath = ''` (`src/context/constants.ts`) — app is rooted at `/`, no subdirectory prefix
- `BrowserRouter basename=""` (`src/main.tsx`) — standard root deployment

### Route Behavior Table

| Incoming request path | Static file exists in dist/? | nginx response |
|-----------------------|------------------------------|----------------|
| `/assets/index-abc123.js` | YES | Serve JS file directly |
| `/assets/style-def456.css` | YES | Serve CSS file directly |
| `/favicon.ico` | YES | Serve favicon directly |
| `/auth/sign-in` | NO | Serve `index.html` → React Router handles |
| `/dashboards` | NO | Serve `index.html` → React Router handles |
| `/rvm/dossiers` | NO | Serve `index.html` → React Router handles |
| `/rvm/dossiers/:id` | NO | Serve `index.html` → React Router handles |
| `/rvm/meetings` | NO | Serve `index.html` → React Router handles |
| `/rvm/meetings/:id` | NO | Serve `index.html` → React Router handles |
| `/rvm/decisions` | NO | Serve `index.html` → React Router handles |
| `/rvm/tasks` | NO | Serve `index.html` → React Router handles |
| `/rvm/audit` | NO | Serve `index.html` → React Router handles |
| `/search` | NO | Serve `index.html` → React Router handles |

### Exact nginx Configuration

```nginx
# /etc/nginx/sites-available/rvmflow

server {
    listen 443 ssl;
    server_name rvmflow.com www.rvmflow.com;

    # SSL — populated by certbot after certificate issuance
    ssl_certificate /etc/letsencrypt/live/rvmflow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rvmflow.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Document root: Vite build output
    root /var/www/rvmflow/dist;
    index index.html;

    # SPA fallback — serve index.html for all paths not matching a real file
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    # Vite outputs content-hashed filenames (e.g. index-a1b2c3d4.js)
    # so these can be cached indefinitely
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP → HTTPS redirect
# www → non-www canonical redirect
server {
    listen 80;
    server_name rvmflow.com www.rvmflow.com;
    return 301 https://rvmflow.com$request_uri;
}
```

**Initial setup note:** When first configuring nginx (before certbot has run), create the server block with only `listen 80`, `root`, and `location /` stanzas. Run certbot, which will add the SSL stanzas automatically. Do not manually copy SSL stanzas before certbot has issued the certificate.

---

## 6. Environment Variable Plan

### Variables Required for Build

| Variable | Purpose | Source | Secret? |
|----------|---------|--------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL | No (public value) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard → Project Settings → API → **anon / public** key | No (public value) |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID | Supabase Dashboard → Project Settings → General | No (optional) |

### Critical Characteristics

**These values are baked into the bundle at build time.** The `VITE_` prefix instructs Vite to inject them into the compiled JavaScript output during `npm run build`. They are **not** read from the environment at nginx serve time — they are embedded in `dist/assets/*.js`.

Consequence: the `.env` file must exist **during the build step**. It does not need to exist at nginx serve time. The `dist/` folder contains everything the browser needs.

**The `VITE_SUPABASE_PUBLISHABLE_KEY` is the Supabase anon/public key.** It is safe to include in client-side code — this is the intended use. Supabase Row Level Security (RLS) policies govern what any client can read or write. It is not a credential that grants elevated access.

**The Supabase `service_role` key must NEVER appear in this file.** The service role key bypasses RLS entirely. It belongs only in server-side environments (e.g., a custom backend API, CI/CD secrets). It must never be in a VITE_ variable.

### Storage on VPS

```
/var/www/rvmflow/.env
```

```bash
# Permissions — readable only by the deploy user, not world-readable
chmod 600 /var/www/rvmflow/.env
```

The `.env` file is already in `.gitignore` (confirmed in repository). It must never be committed.

### Build Verification Procedure

After running `npm run build`, verify the build is correct:

```bash
# 1. Confirm dist/ was produced
ls dist/
# Expected: index.html, assets/, vite.svg (or similar)

# 2. Confirm Supabase URL is embedded in the bundle (must appear once)
grep -r "supabase.co" dist/assets/
# Expected: one match showing the project URL

# 3. Confirm service_role key is absent
grep -r "service_role" dist/assets/
# Expected: NO matches — if any match appears, stop immediately

# 4. Confirm .env is not in dist/
ls dist/.env 2>/dev/null && echo "ERROR: .env in dist" || echo "OK: .env not in dist"
```

---

## 7. Domain / DNS / SSL Plan

### www vs. non-www Decision

**Canonical domain: `rvmflow.com` (non-www)**

`www.rvmflow.com` → permanent redirect (301) → `https://rvmflow.com`

### Current State

`rvmflow.com` DNS A record currently points to Lovable's hosting infrastructure.

### SSL Strategy

Let's Encrypt via `certbot` — free, auto-renewing, widely supported.

certbot's `--nginx` flag automatically:
1. Issues the certificate
2. Modifies the nginx config to add SSL stanzas
3. Sets up automatic renewal via systemd timer

Renewal happens automatically every 60 days. No manual intervention required after initial setup.

### Step-by-Step Plan (documentation only — do not execute before migration day)

**Before migration day:**
1. Reduce DNS TTL to 300 seconds (5 minutes) at least 6–24 hours before migration. Lower TTL = faster propagation when A record is changed.
2. **Record the current Lovable A record IP value** — this is the rollback target.

**On migration day:**

| Step | Action | Notes |
|------|--------|-------|
| 1 | Provision VPS, note static IPv4 | Hostinger panel |
| 2 | Complete all VPS setup (Steps 1–7 in Migration Sequence) | Entire setup done while DNS still points to Lovable |
| 3 | Update DNS A record: `rvmflow.com` → VPS IPv4 | Registrar / DNS panel |
| 4 | Update DNS A record: `www.rvmflow.com` → VPS IPv4 | Same IPv4 as above |
| 5 | Wait for DNS propagation | Check: `dig rvmflow.com A` must return VPS IP |
| 6 | Run certbot: `certbot --nginx -d rvmflow.com -d www.rvmflow.com` | Must run AFTER DNS points to VPS (HTTP-01 challenge) |
| 7 | Verify HTTPS: `curl -I https://rvmflow.com` | Must return HTTP/2 200 |

**Redirect behavior summary:**
- `http://rvmflow.com` → `https://rvmflow.com` (permanent, nginx)
- `http://www.rvmflow.com` → `https://rvmflow.com` (permanent, nginx)
- `https://www.rvmflow.com` → `https://rvmflow.com` (permanent, nginx)

---

## 8. Migration Sequence

**Ordered. Do not proceed to the next step until the current step succeeds.**

```
═══════════════════════════════════════════════════════
STAGE A — VPS PREPARATION (DNS still points to Lovable)
Users are unaffected during this entire stage.
═══════════════════════════════════════════════════════

STEP 1 — Provision VPS
  1.1  Purchase Hostinger VPS (KVM 1 or KVM 2 — see Section 3)
  1.2  Set root password / add SSH public key via Hostinger panel
  1.3  Note the static IPv4 address (shown in panel)
  1.4  SSH in: ssh root@<VPS_IP>
  1.5  Confirm OS: lsb_release -a  (must show Ubuntu 22.04)

STEP 2 — Harden OS
  2.1  Update packages: apt update && apt upgrade -y
  2.2  Create non-root deploy user:
         adduser deploy
         usermod -aG sudo deploy
  2.3  Configure firewall:
         ufw allow 22    (SSH)
         ufw allow 80    (HTTP — for certbot challenge + redirect)
         ufw allow 443   (HTTPS)
         ufw enable
         ufw status      (verify three rules active)
  2.4  Optional: disable root SSH login:
         Edit /etc/ssh/sshd_config → PermitRootLogin no
         systemctl restart sshd

STEP 3 — Install runtime stack
  3.1  Install nginx:
         apt install -y nginx
         systemctl enable nginx
         systemctl start nginx
  3.2  Install Node.js v20 LTS:
         curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
         apt install -y nodejs
  3.3  Verify versions:
         node --version   (must show v20.x.x)
         npm --version    (must show 10.x.x or higher)
  3.4  Install certbot:
         apt install -y certbot python3-certbot-nginx
  3.5  Install git:
         apt install -y git

STEP 4 — Clone repository
  4.1  Create web directory:
         mkdir -p /var/www/rvmflow
         chown deploy:deploy /var/www/rvmflow
  4.2  As deploy user, clone repo:
         su - deploy
         cd /var/www/rvmflow
         git clone <REPO_URL> .
  4.3  Verify latest commit:
         git log --oneline -3
         (must match expected latest commit)

STEP 5 — Configure environment variables
  5.1  Create .env:
         nano /var/www/rvmflow/.env
         (Enter the values from Supabase Dashboard)
  5.2  File contents:
         VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
         VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
  5.3  Secure the file:
         chmod 600 /var/www/rvmflow/.env
  5.4  Verify values match Supabase Dashboard → Project Settings → API

STEP 6 — Build the application
  6.1  cd /var/www/rvmflow
  6.2  Install dependencies:
         npm install
  6.3  Build production bundle:
         npm run build
  6.4  Verify build output:
         ls dist/         (must contain index.html + assets/)
         cat dist/index.html | head -5
         (must show: <!doctype html> and <div id="root">)
  6.5  Verify env vars baked in:
         grep -r "supabase.co" dist/assets/   (must find one match)
         grep -r "service_role" dist/assets/  (must find NO matches)

STEP 7 — Configure nginx (HTTP only first)
  7.1  Create site config:
         nano /etc/nginx/sites-available/rvmflow
         (Enter HTTP-only config — see below)
  7.2  HTTP-only config for initial setup:
         ─────────────────────────────────
         server {
             listen 80;
             server_name rvmflow.com www.rvmflow.com;
             root /var/www/rvmflow/dist;
             index index.html;
             location / {
                 try_files $uri $uri/ /index.html;
             }
         }
         ─────────────────────────────────
  7.3  Enable site:
         ln -s /etc/nginx/sites-available/rvmflow /etc/nginx/sites-enabled/
  7.4  Remove default site:
         rm /etc/nginx/sites-enabled/default
  7.5  Test and reload:
         nginx -t         (must output: test is successful)
         systemctl reload nginx

═══════════════════════════════════════════════════════
STAGE B — DNS SWITCH
At this point, DNS is updated. Certbot runs after DNS propagates.
═══════════════════════════════════════════════════════

STEP 8 — Update DNS
  8.1  In DNS/registrar panel:
         A record: rvmflow.com     → <VPS_IP>
         A record: www.rvmflow.com → <VPS_IP>
  8.2  Set TTL to 300 (or lowest available)
  8.3  Wait for propagation:
         dig rvmflow.com A
         (must return <VPS_IP> — not Lovable IP)
  8.4  Estimated propagation: 5 minutes (if TTL was pre-reduced)
       Worst case: up to 48h if TTL was not reduced in advance

STEP 9 — Issue SSL certificate
  9.1  Run certbot:
         certbot --nginx -d rvmflow.com -d www.rvmflow.com
  9.2  When prompted "Please choose whether or not to redirect":
         Select: 2 (Redirect — force HTTPS, recommended)
  9.3  certbot automatically:
         - Issues certificate from Let's Encrypt
         - Modifies /etc/nginx/sites-available/rvmflow with SSL stanzas
         - Adds HTTP → HTTPS redirect
         - Schedules auto-renewal
  9.4  Verify config after certbot:
         nginx -t && systemctl reload nginx
  9.5  Test HTTPS:
         curl -I https://rvmflow.com
         (must return: HTTP/2 200)
  9.6  Test redirect:
         curl -I http://rvmflow.com
         (must return: 301 → https://rvmflow.com)

═══════════════════════════════════════════════════════
STAGE C — APPLY PENDING MIGRATION (if not already done)
═══════════════════════════════════════════════════════

STEP 10 — Apply Phase 26C migration to production Supabase
  10.1  Open Supabase Dashboard → SQL Editor
  10.2  Check if migration already applied:
         SELECT routine_name
         FROM information_schema.routines
         WHERE routine_name = 'set_chair_approval_timestamp';
  10.3  If result returns the function name → already applied. Skip to Step 11.
  10.4  If result is empty → apply migration:
         Paste the full contents of:
         supabase/migrations/20260321210000_chair-approval-server-timestamp.sql
         Click Run.
  10.5  Verify:
         Re-run the SELECT from 10.2 → must now return the function name.

═══════════════════════════════════════════════════════
STAGE D — VALIDATION
═══════════════════════════════════════════════════════

STEP 11 — Validate critical routes (SPA routing)
  Test each URL by entering directly in the browser address bar (direct navigation,
  not clicking a link) and pressing Enter. Also test browser Refresh on each.

  11.1  https://rvmflow.com
        Expected: redirects to /auth/sign-in (if not logged in)
  11.2  https://rvmflow.com/auth/sign-in
        Expected: sign-in page renders, no 404
  11.3  https://rvmflow.com/dashboards  (direct URL + Refresh)
        Expected: page loads, no 404
  11.4  https://rvmflow.com/rvm/dossiers  (direct URL + Refresh)
        Expected: page loads, no 404
  11.5  https://rvmflow.com/rvm/meetings  (direct URL + Refresh)
        Expected: page loads, no 404
  11.6  https://rvmflow.com/rvm/decisions  (direct URL + Refresh)
        Expected: page loads, no 404
  11.7  https://rvmflow.com/rvm/tasks  (direct URL + Refresh)
        Expected: page loads, no 404
  11.8  https://rvmflow.com/rvm/audit  (direct URL + Refresh)
        Expected: page loads, no 404
  11.9  https://rvmflow.com/search  (direct URL + Refresh)
        Expected: page loads, no 404

STEP 12 — Validate login and auth
  12.1  Sign in with secretary_rvm test account
  12.2  Dashboard renders with Secretary-specific role view
  12.3  Sign out → redirects to /auth/sign-in
  12.4  Sign in with chair_rvm test account → Chair dashboard renders
  12.5  Sign in with analyst (admin_reporting) test account → Analyst dashboard renders

STEP 13 — Validate document flow
  13.1  Create a new test dossier
  13.2  Upload a test document to the dossier
  13.3  Download the document — signed URL must resolve and file must download
  13.4  If download fails: check Supabase Storage CORS configuration
        (Storage → Policies → CORS — rvmflow.com must be an allowed origin)

STEP 14 — Validate chair approval timestamp
  14.1  Record chair approval on a test decision (using chair_rvm account)
  14.2  In Supabase Dashboard → Table Editor → rvm_decision
  14.3  Find the row → confirm chair_approved_at is populated
  14.4  Confirm the timestamp is current server time (within seconds of the action)
  14.5  This confirms Phase 26C migration is working correctly

═══════════════════════════════════════════════════════
STAGE E — DECOMMISSION LOVABLE (minimum 72h after validation)
═══════════════════════════════════════════════════════

STEP 15 — Confirm stability
  15.1  Monitor for 72 hours after go-live
  15.2  Confirm all users can reach rvmflow.com on VPS without issues
  15.3  Confirm no CORS, storage, or auth issues reported

STEP 16 — Decommission Lovable
  16.1  Archive or delete the Lovable project
  16.2  Note: Lovable project URL (if any) is now unused
  16.3  Update any internal documentation referencing the Lovable URL
```

---

## 9. Rollback Plan

**Trigger:** Any step from Stage B (DNS switch) onwards fails and cannot be resolved within the agreed window.

### Rollback by Stage

| Stage | Failure | Impact | Rollback action |
|-------|---------|--------|-----------------|
| A (VPS Prep) | Build fails, nginx config invalid | None — DNS not switched yet | Fix on VPS, retry. No user impact. |
| B (DNS Switch) | DNS points to VPS but SSL fails | Users see SSL certificate error | Revert DNS A record to original Lovable IP (see below) |
| C/D (Post-DNS) | Login fails, app broken | Users cannot access system | Revert DNS A record to original Lovable IP |
| D (Validation) | Document upload/download fails | Storage flow broken | Check Supabase CORS. If unresolvable: revert DNS. |

### DNS Rollback Procedure

```
1. Log into DNS/registrar panel
2. Update A record: rvmflow.com → <ORIGINAL_LOVABLE_IP>
3. Update A record: www.rvmflow.com → <ORIGINAL_LOVABLE_IP>
4. Set TTL back to 300 if currently lower
5. Wait for propagation: dig rvmflow.com A
   (must return original Lovable IP)
6. Users are automatically back on Lovable-hosted version
```

### Pre-Migration: Record the Original Lovable IP

Before touching DNS, record the current A record value:
```bash
# From any terminal with DNS access:
dig rvmflow.com A +short
```
Save this value. It is the rollback target.

### What Must NOT Change Until Rollback Confidence Exists

- **Do NOT** delete or archive the Lovable project until the VPS has run successfully for at least 72 hours
- **Do NOT** change Supabase project configuration (URL, keys, RLS policies) during migration
- **Do NOT** apply any additional database migrations on migration day
- **Do NOT** modify the production `.env` values on the VPS without a backup

---

## 10. Pre-Migration Checklist

Complete every item before migration day begins. Each item must be TRUE before proceeding.

### Application Code
- [ ] Phase 26A complete — env vars, lovable-tagger removed, document/dossier atomicity ✅ (Done)
- [ ] Phase 26B complete — axios-mock-adapter moved to devDependencies ✅ (Done)
- [ ] Phase 26C complete — chair_approved_at DB trigger added, client-side assignment removed ✅ (Done)
- [ ] Latest commits pushed to remote repository
- [ ] `npm run build` succeeds locally with no errors or warnings

### Database
- [ ] Phase 26C migration (`20260321210000_chair-approval-server-timestamp.sql`) applied to production Supabase project
- [ ] Verify: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'set_chair_approval_timestamp'` returns the function
- [ ] Super admin bootstrap confirmed deactivated (`is_active = false`, `expires_at` in the past)

### VPS Preparation
- [ ] Hostinger VPS provisioned (KVM 1 or KVM 2)
- [ ] SSH access confirmed
- [ ] VPS static IPv4 address noted and recorded
- [ ] Ubuntu 22.04 fully updated (`apt upgrade` complete)

### Environment Variables
- [ ] `.env` file prepared with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] Values copy-pasted from Supabase Dashboard — not typed manually
- [ ] Confirmed: Supabase **anon/public** key used (not service_role)
- [ ] Service role key confirmed **absent** from `.env`

### DNS Preparation
- [ ] **Current Lovable A record IP recorded** (rollback reference — critical)
- [ ] DNS TTL reduced to 300s at least 6 hours before migration
- [ ] DNS/registrar access confirmed (credentials ready, not locked out)

### SSL
- [ ] Let's Encrypt / certbot strategy confirmed
- [ ] certbot installed on VPS

### Testing Readiness
- [ ] Test accounts available: secretary_rvm, chair_rvm, admin_reporting roles
- [ ] Test dossier available for document upload test
- [ ] Test document available for upload
- [ ] Supabase Storage CORS settings reviewed — `rvmflow.com` is an allowed origin

### Rollback Readiness
- [ ] Original Lovable A record IP recorded and accessible
- [ ] Person with DNS access available during migration window
- [ ] Agreed rollback trigger defined (e.g., "if any validation step fails after 30 minutes of troubleshooting")
- [ ] Lovable project confirmed still active (not archived)

---

## 11. Status

**PHASE 27 COMPLETE — Blueprint ready for execution.**

This document is the authoritative migration blueprint. No migration has been performed. The next action is to execute the Migration Sequence in Section 8 when Devmart is ready to proceed.

**Summary of what this phase produced:**

| Deliverable | Status |
|-------------|--------|
| Architecture decision (Option A — static + nginx) | Documented |
| VPS spec recommendation (KVM 1 or KVM 2) | Documented |
| Required VPS components table | Documented |
| Exact nginx config with SPA fallback | Documented |
| Environment variable plan | Documented |
| Domain / DNS / SSL plan | Documented |
| 16-step ordered migration sequence | Documented |
| Rollback plan with DNS revert procedure | Documented |
| Pre-migration checklist (30 items) | Documented |

**Preceding phases (all code blockers resolved):**

| Phase | Item | Status |
|-------|------|--------|
| 26A | ENV vars, lovable-tagger, document/dossier atomicity | ✅ |
| 26B | axios-mock-adapter dependency classification | ✅ |
| 26C | Chair approval server-side timestamp (DB trigger) | ✅ |
| 27 | VPS migration blueprint | ✅ |

**Remaining before go-live:**
1. Execute migration sequence (Section 8) — manual VPS work
2. Apply Phase 26C migration to production Supabase (if not yet done)

---

*Report generated by Claude Code, 2026-03-21*
*Stopping. Awaiting Devmart approval to execute migration.*
