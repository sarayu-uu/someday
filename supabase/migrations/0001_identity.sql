-- Step 1: pairs + profiles. Read-only to clients; rows are seeded by hand
-- (see supabase/seed.sql). Nothing links a profile to an auth.uid(); the app
-- picks the acting profile per launch, client-side.

create table public.pairs (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table public.profiles (
  profile_id    uuid primary key default gen_random_uuid(),
  pair_id       uuid not null references public.pairs (id),
  display_label text not null,
  push_token    text
);

alter table public.pairs    enable row level security;
alter table public.profiles enable row level security;

-- Any authenticated (anonymous-auth) session can read. See CLAUDE.md
-- "Access model": this cannot tell the two of you from a stranger.
create policy "authenticated read" on public.pairs
  for select to authenticated using (true);

create policy "authenticated read" on public.profiles
  for select to authenticated using (true);

-- No client writes. Drop Supabase's default grants, then give back SELECT only.
revoke all on public.pairs, public.profiles from anon, authenticated;
grant select on public.pairs, public.profiles to authenticated;
