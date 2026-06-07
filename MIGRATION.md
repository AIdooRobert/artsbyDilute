# Legacy Migration Map

The new application preserves the PHP product behavior while moving persistence
to Supabase.

| PHP/MySQL | Supabase |
| --- | --- |
| `admin_users` | `auth.users` + `profiles(role = admin)` |
| `photographers` | `auth.users` + `profiles` + `photographers` |
| `photography_clients` | `auth.users` + `profiles` + `photography_clients` |
| `client_photos` | `client_photos` + private `client-photos` bucket |
| `portfolio_items` | `portfolio_items` + public `public-media` bucket |
| `services` | `services` + public `public-media` bucket |
| `site_settings` | `site_settings` |
| SnapFolio product copy | `product_settings` |
| `contact_messages` | `contact_messages` |
| `team_members` | `team_members` |
| `skills` | `skills` |
| `resume_items` | `resume_items` |
| `testimonials` | `testimonials` |
| `pricing_plans` | `pricing_plans` |
| `subscriptions` | `subscriptions` |
| `admin_activity_logs` | `admin_activity_logs` |

## Important authentication note

Existing PHP password hashes cannot be inserted directly into Supabase Auth.
Create or invite each photographer/admin/client through Supabase Auth, then link
their new Auth UUID to the migrated application row. A password-reset rollout is
the safest production migration.

The included migration command imports the existing photographers, client,
subscriptions, and private gallery files with temporary Auth passwords:

```powershell
npm run legacy:migrate
```

It is idempotent and reads the local XAMPP database and uploads directory by
default. Photographer passwords should be reset by email. Client passwords can
then be reset from the photographer dashboard.

## Media

The public profile, portfolio, and service images from the PHP project are
already copied into `public/legacy` for the initial deployment. They can later
be moved to the Supabase `public-media` bucket without changing the data model.

Upload client photos to the private `client-photos` bucket using this path format:

```text
PHOTOGRAPHER_UUID/CLIENT_UUID/FILE_NAME
```

Then insert that path into `client_photos.storage_path`.
