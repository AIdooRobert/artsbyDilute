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

## Media

Upload public portfolio, service, team, testimonial, and logo files to the
`public-media` bucket and store their public URLs. Upload client photos to the
private `client-photos` bucket using this path format:

```text
PHOTOGRAPHER_UUID/CLIENT_UUID/FILE_NAME
```

Then insert that path into `client_photos.storage_path`.
