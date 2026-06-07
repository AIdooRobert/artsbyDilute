# Robert Aidoo Portfolio + SnapFolio

The React/Node replacement for the original PHP project. It deliberately keeps
the personal portfolio and the photography management product distinct:

- `/` is Robert Aidoo's single-page personal portfolio.
- `/snapfolio` is the SnapFolio photography management landing page.
- `/admin` is the shared superadmin console for both experiences.

## Stack

- Next.js 16 App Router with React 19 and TypeScript
- Tailwind CSS 4
- Lucide React icons
- Supabase Postgres, Auth, Row Level Security, and Storage
- Paystack server-side initialization, callback verification, and webhooks
- Vercel deployment

## Included functionality

- Responsive one-page personal portfolio, project details, services, and contact form
- Separate SnapFolio product landing page and pricing
- Photographer signup, login, password reset, Paystack checkout, and plan upgrades
- Photographer dashboard with client creation, credential resets, usage limits, uploads, and gallery deletion
- Photographer profile and plan-gated custom branding
- Private client login, branded gallery, fullscreen viewer, individual downloads, and ZIP download
- Superadmin CRUD for portfolio, services, team, skills, resume, testimonials, and portfolio settings
- Superadmin management for SnapFolio settings, pricing, messages, photographers, subscriptions, users, and activity logs

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
   CRON_SECRET=
   ```

5. In Supabase Auth settings:

   - Add `http://localhost:3000/auth/callback` as a redirect URL.
   - Add the production `https://YOUR_DOMAIN/auth/callback` URL.
   - Disable public email signup. Accounts are created by protected server actions.

6. Create the first administrator:

   ```powershell
   npm run admin:create -- admin@example.com "Site Admin"
   ```

   The command prompts for the temporary password without placing it in shell
   history or the process list. For non-interactive automation, provide it
   through the temporary `ADMIN_PASSWORD` environment variable.

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

The deployment health check is available at:

```text
https://YOUR_DOMAIN/api/health
```

For local UI testing without Paystack, set `ALLOW_TEST_PAYMENTS=true` and leave
`PAYSTACK_SECRET_KEY` empty. Never use that setting in production.

The superadmin Payments page shows whether Paystack is running in `test`,
`live`, or `unconfigured` mode. Replace test keys with live keys only after the
Paystack account is approved, and configure this production webhook:

```text
https://artsby-dilute.vercel.app/api/paystack/webhook
```

## Security

- Public login, signup, password-reset, contact, and payment actions use
  database-backed rate limits that work across Vercel instances.
- Payment activation is atomic and idempotent in Postgres.
- A protected Vercel Cron job cancels abandoned payment sessions every day and
  removes expired rate-limit buckets.
- Superadmins can rotate their password at `/admin/security`.
- Run `npm run check` before deployment to execute lint, TypeScript, tests,
  dependency auditing, and the production build.

## Vercel

From this directory:

```powershell
vercel
vercel --prod
```

Add every `.env.local` value to Vercel Project Settings. Set
`NEXT_PUBLIC_SITE_URL` to the production domain before the production deploy.

## Existing PHP data

The PHP app remains untouched in `C:\xampp\htdocs\SnapFolio`. Its public
portfolio content and media have been carried into the seed and `public/legacy`.
See `MIGRATION.md` for the remaining account and private-gallery migration work.
