-- Seed: one pair, two profiles.
--
-- How to run: Supabase dashboard -> SQL Editor -> New query -> paste this
-- file -> Run (after running migrations/0001_identity.sql).
--
-- Run it ONCE; re-running adds a second pair and two more profiles.
-- Person A is Sarayu, person B is Rahul. To rename later:
--   update public.profiles set display_label = 'New name' where display_label = 'Sarayu';

with new_pair as (
  insert into public.pairs default values returning id
)
insert into public.profiles (pair_id, display_label)
select new_pair.id, v.label
from new_pair, (values ('Sarayu'), ('Rahul')) as v(label);
