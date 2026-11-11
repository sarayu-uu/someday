-- Step 2: ideas + memory photos.
--
-- How to run: Supabase dashboard -> SQL Editor -> paste -> Run, after
-- 0001_identity.sql and seed.sql.
--
-- Same access model as step 1 (see CLAUDE.md "Access model"): any authenticated
-- (anonymous-auth) session may read/write ideas of the seeded pair. `added_by`
-- is client-asserted, so it is a label, not a security boundary.

create table public.ideas (
  id           uuid primary key default gen_random_uuid(),
  pair_id      uuid not null references public.pairs (id),
  category     text not null,
  title        text not null check (length(btrim(title)) > 0),
  note         text,
  source_url   text,
  image_url    text,
  added_by     uuid not null references public.profiles (profile_id),
  status       text not null default 'inbox' check (status in ('inbox', 'top10', 'done')),
  -- Fractional rank within a category's Top 10: reordering rewrites one row.
  rank         double precision,
  created_at   timestamptz not null default now(),
  done_at      timestamptz,
  photo_url    text,
  rating       smallint check (rating between 1 and 5),
  would_repeat boolean,
  check ((status = 'top10') = (rank is not null)),
  check (status = 'done' or (done_at is null and rating is null and would_repeat is null and photo_url is null))
);

create index ideas_pair_category_idx on public.ideas (pair_id, category, status);

-- Top 10 is capped at 10 per category. Enforced here so two phones racing each
-- other can't overfill it; the app handles the "swap one out" flow before this.
create function public.enforce_top10_cap() returns trigger
language plpgsql as $$
begin
  if new.status = 'top10' and (
    select count(*) from public.ideas
    where pair_id = new.pair_id and category = new.category and status = 'top10' and id <> new.id
  ) >= 10 then
    raise exception 'Top 10 for % is full', new.category using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger ideas_top10_cap
  before insert or update on public.ideas
  for each row execute function public.enforce_top10_cap();

alter table public.ideas enable row level security;

create policy "authenticated read" on public.ideas
  for select to authenticated using (pair_id in (select id from public.pairs));

create policy "authenticated insert" on public.ideas
  for insert to authenticated
  with check (
    pair_id in (select id from public.pairs)
    and exists (select 1 from public.profiles p where p.profile_id = added_by and p.pair_id = ideas.pair_id)
  );

create policy "authenticated update" on public.ideas
  for update to authenticated
  using (pair_id in (select id from public.pairs))
  with check (pair_id in (select id from public.pairs));

create policy "authenticated delete" on public.ideas
  for delete to authenticated using (pair_id in (select id from public.pairs));

revoke all on public.ideas from anon, authenticated;
grant select, insert, update, delete on public.ideas to authenticated;

-- Both phones see reorders/swipes live.
alter publication supabase_realtime add table public.ideas;

-- Memory photos. Public-read bucket: files live at unguessable paths and the
-- app shows them with plain <Image> URLs. Writes need an authenticated session.
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

create policy "memories authenticated insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'memories');

create policy "memories authenticated delete" on storage.objects
  for delete to authenticated using (bucket_id = 'memories');
