# SnapFolio Next

The complete React/Node replacement for the original PHP SnapFolio project.

## Stack

- Next.js 16 App Router with React 19 and TypeScript
- Tailwind CSS 4
- Lucide React icons
- Supabase Postgres, Auth, Row Level Security, and Storage
- Paystack server-side initialization, callback verification, and webhooks
- Vercel deployment

## Included functionality

- Responsive public portfolio, services, pricing, project details, and contact form
- Photographer signup, login, password reset, Paystack checkout, and plan upgrades
- Photographer dashboard with client creation, credential resets, usage limits, uploads, and gallery deletion
- Photographer profile and plan-gated custom branding
- Private client login, branded gallery, fullscreen viewer, individual downloads, and ZIP download
- Admin dashboard and CRUD for portfolio, services, team, skills, resume, testimonials, and pricing
- Admin management for messages, photographers, subscriptions, settings, users, and activity logs

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create a Supabase project. The Vercel Marketplace integration is supported, or use an existing project.

3. Run these files in the Supabase SQL editor, in order:

   ```text
   supabase/migrations/001_initial_schema.sql
   supabase/seed.sql
   ```

4. Copy `.env.example` to `.env.local` and fill in the values:

   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   PAYSTACK_SECRET_KEY=
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
   ALLOW_TEST_PAYMENTS=false
   ```

5. In Supabase Auth settings:

   - Add `http://localhost:3000/auth/callback` as a redirect URL.
   - Add the production `https://YOUR_DOMAIN/auth/callback` URL.
   - Disable public email signup. Accounts are created by protected server actions.

6. Create the first administrator:

   ```powershell
   npm run admin:create -- admin@example.com "StrongPassword" "Site Admin"
   ```

7. Start the app:

   ```powershell
   npm run dev
   ```

## Paystack

Set the Paystack webhook URL to:

```text
https://YOUR_DOMAIN/api/paystack/webhook
```

The checkout callback is generated as:

```text
https://YOUR_DOMAIN/api/paystack/callback
```

For local UI testing without Paystack, set `ALLOW_TEST_PAYMENTS=true` and leave
`PAYSTACK_SECRET_KEY` empty. Never use that setting in production.

## Vercel

From this directory:

```powershell
vercel
vercel --prod
```

Add every `.env.local` value to Vercel Project Settings. Set
`NEXT_PUBLIC_SITE_URL` to the production domain before the production deploy.

## Existing PHP data

The PHP app remains untouched in `C:\xampp\htdocs\SnapFolio`. The new Supabase
schema maps the existing tables, but the seed intentionally starts clean.
See `MIGRATION.md` for the legacy table and media mapping.
