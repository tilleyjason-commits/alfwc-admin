# ALFWC Admin conventions

## Stack

- React 19
- TypeScript
- Vite
- Supabase Auth/Postgres/Storage
- CSS modules avoided; use `src/index.css` for a small shared design system.

## Quality gates

Run:

```bash
npm run typecheck
npm run build
```

The app intentionally keeps Supabase client code behind environment variables so it can run locally only after `.env.local` is configured.

## Content model

Content lives in `public.app_content` with flexible JSON payloads by section:

- `home`
- `sermon`
- `event`
- `quick_action`
- `links`
- `onboarding`

Status flow is `draft` → `published` → `archived`. Editors can save drafts. Publishers and admins can publish. Admins can manage roles and delete content/assets.

## Images

Images are stored in the public Supabase Storage bucket `app-assets`. The image editor exports a cropped PNG and can add text overlays before upload.
