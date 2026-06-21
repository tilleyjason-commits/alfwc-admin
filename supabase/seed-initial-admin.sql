-- Run this after the first admin account has signed in at least once.
-- Replace the email/name if needed.
update public.admin_profiles
set role = 'admin',
    display_name = 'Jason Tilley'
where id = (
  select id
  from auth.users
  where email = 'tilley.jason@gmail.com'
);
