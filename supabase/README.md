# Supabase setup

1. Create a new Supabase project for the ALFWC admin backend.
2. In the SQL editor, run `supabase/migrations/20260620_alfwc_admin_schema.sql`.
3. In Authentication → URL Configuration, add the deployed admin app URL and local dev URL (`http://localhost:5173`) as allowed redirect URLs.
4. In Authentication → Providers, enable Email and Google if you want Google sign-in.
5. Sign in once with the first admin account.
6. Run `supabase/seed-initial-admin.sql` to promote that account to `admin`.
7. Invite publishers/editors through Supabase Auth or the Users page in this admin app.

The schema creates:

- `admin_profiles` with `admin`, `publisher`, and `editor` roles.
- `app_content` with draft/preview/publish/archive status.
- `content_revisions` for version history.
- `audit_events` for safety/audit logs.
- A public `app-assets` storage bucket for uploaded and edited images.
