# ALFWC Admin

Separate admin app/repo for Abundant Life Family Worship Center church app content management.

## Stack

- React + TypeScript + Vite
- Supabase Auth, Postgres, Storage
- Draft → preview → publish workflow
- Role-based access: editor, publisher, admin
- Image upload, crop, zoom, and text overlay editing
- Revision history and audit events

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Supabase setup

Run the migration in `supabase/migrations/20260620_alfwc_admin_schema.sql` in your Supabase SQL editor. After the first admin signs in, run `supabase/seed-initial-admin.sql` to promote that user to `admin`.

## Verification

```bash
npm run typecheck
npm run build
```
