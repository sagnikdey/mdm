# Vendor Onboarding — Invite-Only Entry Point & App Separation

How and where the invite-only onboarding flow plugs into your existing monorepo. Tailored to your actual repo: a Turborepo (`next-monorepo`) using **npm workspaces** (scope `@workspace/*`), with `apps/web` (the MDM) and shared `packages/ui`, `packages/eslint-config`, `packages/typescript-config`.

> Note on tooling: your root `package.json` sets `"packageManager": "npm@10.9.4"` and `"workspaces": ["apps/*", "packages/*"]`. The README's `pnpm dlx …` line is leftover template text — use `npm` throughout. All commands below use npm.

---

## Part 1: The Recommendation

**Add the onboarding flow as a second app in the monorepo — `apps/onboarding` — deployed to its own domain, sharing code through workspace packages.**

```
                 ┌───────────────────────────────────────────────┐
                 │              Turborepo (one repo)             │
                 ├───────────────────────────────────────────────┤
                 │                                               │
   app.company   │   apps/web            apps/onboarding         │  onboarding.company
   ───────────►  │   (MDM, admin)        (invite-only, public)   │  ◄───────────
                 │        │                      │               │
                 │        │   creates invite     │  redeems      │
                 │        │   approves vendor     │  invite +     │
                 │        │                      │  runs wizard   │
                 │        └──────────┬───────────┘               │
                 │                   ▼                           │
                 │            packages/db  (@workspace/db)       │
                 │            packages/ui  (@workspace/ui)       │
                 │                                               │
                 └───────────────────────────────────────────────┘
                                     │
                                     ▼
                              PostgreSQL (shared)
```

### Why a separate app (and not a route group or a subdomain rewrite)

You said the flow should be separate from the MDM. In a Turborepo you have three ways to do that; here's why a second app wins for this case:

| Option | Isolation | Verdict |
|--------|-----------|---------|
| Route group inside `apps/web` (`app/(onboarding)/`) | Shares deploy, auth, middleware, bundle with the MDM | ❌ Not actually separate — a vendor bug can take down the MDM, and they share a session surface |
| Subdomain via middleware rewrites in `apps/web` | One deploy, conditional routing | ⚠️ Still one app and one blast radius; middleware gets complex |
| **Second app `apps/onboarding`** | Own deploy, own auth, own middleware, own domain | ✅ True separation; shares only vendored packages |

The second app is the idiomatic Turborepo answer. The vendor-facing surface has a completely different threat model (public, unauthenticated visitors arriving on an invite link) than your internal MDM (trusted, authenticated staff). Keeping them as separate deploys means:

- A vulnerability or outage in one can't reach the other.
- The onboarding app ships **no** admin code, no MDM data-access, nothing but the wizard — smaller attack surface.
- You can rate-limit, WAF, and scale the public app independently.
- Auth is cleanly split: MDM uses your staff auth; onboarding uses short-lived invite tokens.

They still share the two things that matter — your **UI components** (`@workspace/ui`, already there) and your **database schema** (`@workspace/db`, which we'll create) — so there's no duplication.

---

## Part 2: Target Monorepo Layout

```
mdm/
├── apps/
│   ├── web/                      # existing MDM (admin) — deploy: app.company.com
│   │   └── app/
│   │       └── admin/
│   │           └── vendors/
│   │               └── invite/   # ← admin action: create + send invitations
│   │
│   └── onboarding/               # NEW public app — deploy: onboarding.company.com
│       ├── app/
│       │   ├── invite/
│       │   │   └── [token]/
│       │   │       └── page.tsx  # ★ THE ENTRY POINT
│       │   ├── onboarding/
│       │   │   └── page.tsx      # the 8-step wizard (from the onboarding guide)
│       │   ├── expired/page.tsx  # invalid / expired / used token landing
│       │   └── layout.tsx
│       ├── lib/
│       │   ├── session.ts        # scoped vendor session (cookie)
│       │   └── invitations.ts    # token verification
│       ├── middleware.ts         # protects /onboarding/*
│       ├── next.config.mjs
│       └── package.json
│
├── packages/
│   ├── ui/                       # existing shared shadcn components (@workspace/ui)
│   ├── db/                       # NEW shared Drizzle schema + client (@workspace/db)
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── index.ts
│   │   │   │   ├── mdm.ts         # stores, vendors, products… (moved from apps/web)
│   │   │   │   └── onboarding.ts  # applications + invitations (from onboarding guide)
│   │   │   ├── client.ts          # drizzle client
│   │   │   └── index.ts
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── eslint-config/
│   └── typescript-config/
│
├── turbo.json
└── package.json
```

---

## Part 3: Step A — Extract the Schema into `packages/db`

Both apps need the same tables, so the schema must live in a shared package instead of inside `apps/web`.

```bash
mkdir -p packages/db/src/schema
```

**`packages/db/package.json`**
```json
{
  "name": "@workspace/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "drizzle-orm": "^0.36.0",
    "pg": "^8.13.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "@types/pg": "^8.11.0",
    "@workspace/typescript-config": "*"
  }
}
```

**`packages/db/src/client.ts`**
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
export { pool };
```

**`packages/db/src/index.ts`**
```typescript
export * from './client.js';
export * from './schema/index.js';
```

Move your existing MDM tables here as `src/schema/mdm.ts`, and drop the `onboarding.ts` schema (applications, contacts, addresses, documents — from the onboarding guide) into `src/schema/onboarding.ts`. Then both apps import the same thing:

```typescript
import { db, vendorApplications, vendorInvitations } from '@workspace/db';
```

Add `@workspace/db` to each app's dependencies:

```jsonc
// apps/web/package.json  and  apps/onboarding/package.json
"dependencies": {
  "@workspace/db": "*",
  "@workspace/ui": "*"
}
```

---

## Part 4: Step B — The Invitation Model

Add this table to `packages/db/src/schema/onboarding.ts`. The token is **never stored in plaintext** — only its hash.

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const invitationStatus = pgEnum('invitation_status', [
  'pending', 'redeemed', 'expired', 'revoked',
]);

export const vendorInvitations = pgTable('vendor_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),

  // SHA-256 hash of the raw token. The raw token only ever lives in the emailed URL.
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),

  // The invite is bound to this email — the vendor cannot change who they onboard as.
  invitedEmail: varchar('invited_email', { length: 255 }).notNull(),
  invitedCompany: varchar('invited_company', { length: 255 }),

  status: invitationStatus('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),

  // Bookkeeping
  invitedByEmail: varchar('invited_by_email', { length: 255 }).notNull(), // the MDM staff user
  applicationId: uuid('application_id'),   // set once redeemed → links to vendor_applications
  redeemedAt: timestamp('redeemed_at'),

  createdAt: timestamp('created_at').defaultNow(),
});
```

Generate the migration from the db package:

```bash
npm run db:generate -w @workspace/db
npm run db:migrate -w @workspace/db
```

---

## Part 5: Step C — Creating an Invitation (in `apps/web`, admin side)

Invitation *creation* belongs to the MDM, because only authenticated staff can invite. This is a server action / API route inside `apps/web`.

```typescript
// apps/web/app/admin/vendors/invite/actions.ts
'use server';

import { randomBytes, createHash } from 'node:crypto';
import { db, vendorInvitations } from '@workspace/db';
import { requireStaff } from '@/lib/auth';           // your existing MDM auth
import { sendInvitationEmail } from '@/lib/email';

const ONBOARDING_URL = process.env.ONBOARDING_APP_URL!; // e.g. https://onboarding.company.com
const EXPIRY_DAYS = 14;

export async function createVendorInvitation(input: {
  email: string;
  company?: string;
}) {
  const staff = await requireStaff();

  // 1. Generate a high-entropy raw token (goes in the URL, never stored)
  const rawToken = randomBytes(32).toString('base64url');

  // 2. Store only its hash
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(vendorInvitations).values({
    tokenHash,
    invitedEmail: input.email.toLowerCase(),
    invitedCompany: input.company,
    invitedByEmail: staff.email,
    expiresAt,
  });

  // 3. Email the raw token as a link into the SEPARATE onboarding app
  const inviteUrl = `${ONBOARDING_URL}/invite/${rawToken}`;
  await sendInvitationEmail({
    to: input.email,
    company: input.company,
    inviteUrl,
    expiresAt,
  });

  return { ok: true };
}
```

Key points:

- The link points at the **onboarding app's domain**, not the MDM.
- The vendor receives the raw token; your database holds only the SHA-256 hash. Even a full DB dump can't be used to redeem invites.
- The invite is bound to `invitedEmail`, which becomes the application's `ownerEmail` — the vendor can't onboard as a different company.

---

## Part 6: Step D — The Entry Point ★

This is the answer to "where is the entry point": **`apps/onboarding/app/invite/[token]/page.tsx`**. It's the only public, unauthenticated route in the onboarding app. It validates the token, mints a scoped session, and forwards the vendor into the wizard.

```typescript
// apps/onboarding/app/invite/[token]/page.tsx
import { redirect } from 'next/navigation';
import { createHash } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { db, vendorInvitations, vendorApplications } from '@workspace/db';
import { createVendorSession } from '@/lib/session';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Hash the incoming raw token and look it up
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const invite = await db.query.vendorInvitations.findFirst({
    where: eq(vendorInvitations.tokenHash, tokenHash),
  });

  // 2. Reject anything not cleanly redeemable
  if (!invite) redirect('/expired?reason=invalid');
  if (invite.status === 'revoked') redirect('/expired?reason=revoked');
  if (invite.status === 'redeemed') {
    // Already used — but if it's the same person resuming, let them back in
    // by re-establishing their session against the linked application.
    if (invite.applicationId) {
      await createVendorSession({
        email: invite.invitedEmail,
        applicationId: invite.applicationId,
      });
      redirect('/onboarding');
    }
    redirect('/expired?reason=used');
  }
  if (invite.expiresAt < new Date()) {
    await db.update(vendorInvitations)
      .set({ status: 'expired' })
      .where(eq(vendorInvitations.id, invite.id));
    redirect('/expired?reason=expired');
  }

  // 3. First valid redemption — create the draft application bound to the invited email
  const [application] = await db.insert(vendorApplications).values({
    ownerEmail: invite.invitedEmail,
    legalName: invite.invitedCompany ?? null,
  }).returning();

  // 4. Mark the invite redeemed (single-use) and link it to the application
  await db.update(vendorInvitations)
    .set({
      status: 'redeemed',
      redeemedAt: new Date(),
      applicationId: application.id,
    })
    .where(eq(vendorInvitations.id, invite.id));

  // 5. Establish a scoped vendor session (httpOnly cookie) and enter the wizard
  await createVendorSession({
    email: invite.invitedEmail,
    applicationId: application.id,
  });

  redirect('/onboarding');
}
```

The flow at the door:

```
  Vendor clicks emailed link
  → GET onboarding.company.com/invite/<rawToken>
      → hash + lookup
          → invalid/expired/revoked/used ─▶ /expired  (dead end, no session)
          → valid, first use ─▶ create draft application
                              ─▶ mark invite redeemed (single-use)
                              ─▶ set scoped session cookie
                              ─▶ redirect to /onboarding (the wizard)
```

---

## Part 7: Step E — Scoped Vendor Session + Middleware

The onboarding app needs its own lightweight session — completely separate from the MDM's staff auth. A signed, httpOnly cookie carrying the application id and email is enough. Use `jose` to sign it.

```bash
npm install jose -w @workspace/onboarding
```

**`apps/onboarding/lib/session.ts`**
```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.ONBOARDING_SESSION_SECRET!);
const COOKIE = 'vendor_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface VendorSession {
  email: string;
  applicationId: string;
}

export async function createVendorSession(session: VendorSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function getVendorSession(): Promise<VendorSession | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string, applicationId: payload.applicationId as string };
  } catch {
    return null;
  }
}
```

**`apps/onboarding/middleware.ts`** — the wizard is only reachable with a valid session; `/invite/*` stays public.

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.ONBOARDING_SESSION_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('vendor_session')?.value;
  if (!token) return NextResponse.redirect(new URL('/expired?reason=no_session', req.url));
  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/expired?reason=no_session', req.url));
  }
}

// Protect the wizard; leave /invite and /expired open.
export const config = {
  matcher: ['/onboarding/:path*'],
};
```

Now the wizard page reads `ownerEmail` from the session instead of the stubbed helper from the earlier guide:

```typescript
// apps/onboarding/app/onboarding/page.tsx
import { getVendorSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const session = await getVendorSession();
  if (!session) redirect('/expired?reason=no_session');

  // session.applicationId + session.email drive the wizard.
  // (Wizard components come from the vendor onboarding guide.)
}
```

That replaces the `getCurrentVendorEmail()` stub referenced in the onboarding flow guide — the email now comes from the redeemed invite, not from user input, so it's trustworthy.

---

## Part 8: Deployment — Two Projects, One Repo

Turborepo builds both apps; you deploy them as two projects pointed at the same repo but different root directories.

On Vercel (or equivalent):

| Project | Root directory | Domain | Env |
|---------|----------------|--------|-----|
| `mdm-web` | `apps/web` | `app.company.com` | `DATABASE_URL`, staff-auth vars, `ONBOARDING_APP_URL` |
| `mdm-onboarding` | `apps/onboarding` | `onboarding.company.com` | `DATABASE_URL`, `ONBOARDING_SESSION_SECRET` |

Both read the same `DATABASE_URL`. Only the MDM knows `ONBOARDING_APP_URL` (to build invite links). Only the onboarding app knows `ONBOARDING_SESSION_SECRET`. The apps never call each other's code — they coordinate purely through the shared database, which is exactly the isolation you want.

`turbo.json` already orchestrates the build graph; adding `apps/onboarding` needs no turbo changes since your pipeline globs `apps/*`.

---

## Part 9: Security Checklist

- [ ] **Tokens hashed at rest** — store SHA-256, never the raw token. Raw token lives only in the emailed URL.
- [ ] **High entropy** — 32 random bytes (`randomBytes(32)`), base64url encoded.
- [ ] **Single-use** — mark `redeemed` on first successful use; re-clicks only resume the same application, never create a new one.
- [ ] **Expiry** — 14-day window; expired tokens flip to `expired` and dead-end at `/expired`.
- [ ] **Email binding** — the application's `ownerEmail` is the invited email; the vendor can't onboard as someone else.
- [ ] **Revocation** — staff can set an invite to `revoked` from the MDM; redemption checks status.
- [ ] **Scoped session** — onboarding cookie is httpOnly, secure, sameSite=lax, and signed with a secret the MDM app doesn't share.
- [ ] **No admin code in the public app** — `apps/onboarding` ships only the wizard; it never imports MDM admin modules.
- [ ] **Rate limit `/invite/[token]`** — throttle by IP to blunt token-guessing (though 32 bytes is already infeasible to brute-force).
- [ ] **Rate limit invite creation** — cap how many invites staff can mint per hour.

---

## Part 10: Build Order

1. **Scaffold `packages/db`** — extract MDM schema, add onboarding + invitation schema, wire the client. Migrate.
2. **Point `apps/web` at `@workspace/db`** — replace its local schema imports. Confirm the MDM still runs.
3. **Add the invite creation action** in `apps/web/app/admin/vendors/invite/` + an email template.
4. **Scaffold `apps/onboarding`** — new Next.js app in the workspace, depends on `@workspace/ui` and `@workspace/db`.
5. **Build the entry point** — `app/invite/[token]/page.tsx`, `/expired` landing, `lib/session.ts`, `middleware.ts`.
6. **Drop in the wizard** from the vendor onboarding guide under `app/onboarding/`, reading `ownerEmail` from the session.
7. **Wire the approval side** in `apps/web` (review queue + promotion to `vendors`) — already specified in the onboarding guide.
8. **Deploy two projects**, two domains, shared `DATABASE_URL`.

---

## Summary

- **Where the entry point lives:** `apps/onboarding/app/invite/[token]/page.tsx` — a new, separate app in your existing Turborepo, on its own domain.
- **How it stays separate:** own deploy, own auth (scoped invite-token session), own middleware, no admin code. It shares only `@workspace/ui` and a new `@workspace/db`.
- **How invites work:** the MDM (`apps/web`) mints a hashed, single-use, 14-day, email-bound token and emails a link to the onboarding domain; the entry point validates it, creates the draft application, sets a scoped session, and drops the vendor into the wizard.
- **How the two halves meet:** only at the shared PostgreSQL database — the MDM creates invites and approves applications; the onboarding app redeems invites and collects data. Clean blast-radius separation, no duplicated code.
