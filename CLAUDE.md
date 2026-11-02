# Someday Jar

A shared planner for two people to dump every "we should do this sometime" idea
in one place, then actually work through it together instead of re-deciding
from scratch every time you have a free evening.

This file is project context for whoever (human or Claude Code) builds this
next. Read it before writing code. It was revised after a first build
session flagged several gaps — see the changelog at the bottom.

## Who this is for

Exactly two people, in a committed relationship, sharing one account space.
Not a general-purpose multi-user product. Every decision below should
optimize for "feels personal to us" over "scales to many users."

- Person A: Android phone (primary — gets full native share-sheet integration)
- Person B: iPhone. No paid Apple Developer account assumed. A sideloaded
  dev build expires after 7 days without one, so Person B's realistic path
  is the Expo **web build installed as a PWA**, plus an iOS Shortcut for the
  share-sheet workaround (see Platform-specific entry points). If a paid
  Apple account gets added later, a real iOS app + Share Extension replaces
  both of those.

## Core concept

Three layers, not one flat list:

1. **The jar** (home screen) — purely decorative. A big illustrated mason jar
   stuffed with colored paper notes, one per saved idea. It exists to make the
   pile of ideas feel real and alive. It is NOT tappable/interactive — do not
   wire up note-tapping. Its only job is to be looked at.
2. **Your Lists** (reached by scrolling/swiping past the jar — a page
   transition, not a modal) — the real navigation surface. A small
   auto-rotating carousel surfaces one random saved idea every few seconds
   (ambient "oh yeah, remember this" reminder), followed by a grid/list of
   every category.
3. **Category detail** — the actual working view, per category, split into:
   - **Top 10** — a short, manually curated, ranked shortlist (drag to
     reorder, swipe to mark done). This is what you check when you actually
     have time — a pre-filtered "ready to do" queue instead of the full pile.
     Capped at 10 per category. Once full, promoting an 11th idea prompts
     "swap out one to make room" — show the current Top 10 with a quick pick
     for which one drops back to All Ideas, rather than silently blocking or
     silently bumping the lowest-ranked one.
   - **All ideas** — the raw, unsorted inbox for that category. New ideas
     always land here first. You promote something into the Top 10 by
     dragging it over; nothing is auto-promoted.
   - Every idea can be **edited** (title/note/category/photo) and **deleted**
     from either list. Deleting is a confirm-then-remove; there's no trash/undo
     for delete in MVP.

Closing the loop: swiping a Top 10 item to "done" opens a feedback sheet
(add a photo, rate it 1–5 stars, answer "want to do this again?" yes/no),
then files it into Memory Lane as a torn ticket stub with a Polaroid-style
photo. This is the only path into Memory Lane — there's no manual "add past
memory" flow in MVP. A ticket in Memory Lane can be **unmarked as done**
(an "undo" action on the ticket itself, no time limit) which deletes the
memory and returns the idea to its category's Top 10. There is no separate
"favorite/heart" field on an idea — the only indicators a ticket shows are
its star rating and, if `wouldRepeat` is true, a small repeat-arrow icon.

**Gifts (a sealed category) is paused for this build** — it is not in the
categories list, screen inventory or build order. The full design is kept
under "Paused: Gifts" below so it can be resumed without redesigning it.

## Categories (fixed list for MVP — not user-creatable yet)

Activities, Places, Movies, Food, Restaurants & Cafes, Topics to Talk About,
Things to Buy, Books, Recipes, Songs & Playlists, Games, At-Home Dates,
Big Dreams, Inside Jokes. (14 categories. Gifts is paused — see below.)

## Visual design system

Mood: a personal scrapbook/journal kept by two people, not a SaaS app.
Warm, handmade, a little playful. Every screen shares this language —
don't let any individual screen drift into generic app styling.

**The published design canvas and the three reference PNGs generated from it
are the source of truth for every visual detail, including exact category
colors** — this section is a working approximation, written before the
designs were finalized, and is known to disagree with them in places (e.g.
this doc says Activities is orange-ish and Food is red; the approved
designs show Activities as yellow and Food as orange). When the two
conflict, match the canvas/PNGs, not the hex values below, and update this
file's palette once the full category color set is locked.

**Palette (approximate — verify against the canvas before using)**
- Paper/background: `#F8F4E9` (off-white, warm, with very subtle grain —
  faint low-opacity radial blotches + a fine diagonal hatching texture)
- Ink (primary text): `#3A2A1F`
- Ink soft (secondary text): `#7A6650`
- Accent / primary action: `#C1543A` (terracotta/clay)
- Category colors: pull all 14 from the canvas directly rather than from
  this file — they haven't all been assigned/confirmed here yet.

**Type**
- Headings/handwritten accents: Caveat (600/700) — titles, tags, ticket
  titles, the jar's hanging label
- Everything else: Quicksand (500/600/700) — body copy, buttons, lists

**Recurring motifs**
- Washi tape strips (diagonal candy-stripe pattern, semi-transparent) behind
  page titles, color varied per section for light wayfinding
- Small pencil-doodle accents tucked in corners, used sparingly
- Completed items render as torn ticket stubs (dashed perforation, punched
  circular holes, a small Polaroid-style photo clipped to one side)
- Right-edge "index tabs" (Jar / Add / Memories) sticking out of the screen
  edge like notebook tabs — this is primary nav. No hamburger menu, no
  bottom tab bar.
- No fake status bars, no AI-generic rounded-card-with-soft-shadow kit
  applied indiscriminately — keep the hand-placed, slightly-imperfect feel
  (tiny alternating rotations on stacked cards/tickets)
- There is **no "Surprise us" button** in the current design — it was cut.
  The random-idea carousel on Your Lists is the only "surprise me" surface.
- The small heart-icon button top-right on the Jar and Your Lists screens is
  a **Settings/profile entry point** (tap to see both partners' profiles,
  notification cadence, backup/export) — not a favorite/like toggle, and not
  decorative. This is the only way into Settings; there's no edge tab for it.

## Screen inventory

1. Home (Jar) — decorative only, heart icon opens Settings
2. Your Lists — carousel + category grid
3. Category Detail — Top 10 + All Ideas (two tabs); includes edit/delete on
   any idea
4. Add Idea — bottom sheet; manual entry or smart-paste from a shared link;
   pick category; "who it's from" defaults to the session's acting profile
5. Mark as Done — bottom sheet feedback popup (photo, rating, repeat y/n)
6. Memory Lane — ticket stub list of everything completed; supports undo-done
7. Settings — the two profiles, notification cadence, backup/export; reached
   via the heart icon, not an edge tab
8. Who's opening the app? — a picker of the two names, shown the first
   time on a device and again after "Not X? Switch" (home screen, until
   Settings exists). The tapped name becomes the acting `profile_id` (tags
   `added_by`, drives "added by you / added by him" labels) and is
   **remembered on this device** (AsyncStorage), so later launches skip the
   picker. It is the only identity UI in the app.

(Gifts screen — paused, see "Paused: Gifts".)

## Tech stack

**App: React Native + Expo**
Single codebase for Android + iOS + web, EAS Build for installable Android
binaries. Use Expo Router for navigation, `react-native-reanimated` +
`react-native-gesture-handler` for the swipe-down jar→lists transition and
swipe-to-complete rows, and `react-native-draggable-flatlist` for Top 10
reordering.

Web/laptop use: Expo's web target doubles as Person B's realistic install
path (installed PWA) given no paid Apple account is assumed — see "Who this
is for." Treat Android as the primary target; web and iOS both need to work,
but iOS is web-only for now.

**Backend: Supabase** (switched from an earlier Firebase draft — see
changelog)
- **Postgres** for data, with **Row Level Security (RLS)** enabled on every
  table. With Gifts paused, the policies are deliberately simple — see
  "Access model" under Data model for exactly what they do and don't protect.
- **Supabase anonymous auth** (`supabase.auth.signInAnonymously()`), called
  silently at launch. There is **no login, sign-up, password or email flow
  anywhere in the app, ever** — no credentials, nothing typed. Anonymous
  sign-ins must be enabled in the Supabase dashboard (Auth → Providers).
  The anonymous session exists only so requests carry an authenticated JWT
  that RLS can require; it is **not** tied to a person or a pair. Who is
  using the app is decided by the "Who's opening the app?" picker
  (client-side only; the choice is remembered on the device, see below).
- **Supabase Storage** for memory/photo uploads, with a bucket policy
  requiring an authenticated (anonymous) session, same as the tables.
- **Supabase Edge Functions** for: fetching link-preview metadata
  (title/image) from a shared URL server-side (avoids doing it client-side,
  which hits CORS on most of these sites). No separate paid plan is required
  to deploy functions on Supabase's free tier, unlike Firebase Cloud
  Functions which need the Blaze plan even at low usage.
- Use `@supabase/supabase-js` directly — it's a plain HTTP/websocket client,
  so it works identically in Expo Go, a dev client build, and the web
  target. (This sidesteps the Firebase problem where `react-native-firebase`
  requires native modules and won't run in Expo Go or on web at all.)
- Realtime: Supabase's Postgres Changes / Realtime subscriptions cover the
  "both people see Top 10 reorders and swipes live" requirement that
  Firestore listeners were chosen for originally.
- Push notifications (if/when the out-of-scope nudges feature gets built):
  Expo's own push service, independent of either backend.

## Data model (Postgres tables, Supabase)

```sql
-- Exactly one row, seeded by hand in Supabase at project setup.
pairs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now()
)

-- Exactly two rows, seeded by hand at project setup (one per person). Both
-- are always available as options in the per-launch picker. Nothing links a
-- profile to an auth.uid(); profile_id is just a stable identity for data.
profiles (
  profile_id    uuid primary key default gen_random_uuid(),
  pair_id       uuid references pairs(id) not null,
  display_label text not null,          -- "A" or "B", display name later
  push_token    text
)

ideas (
  id            uuid primary key default gen_random_uuid(),
  pair_id       uuid references pairs(id) not null,
  category      text not null,
  title         text not null,
  note          text,
  source_url    text,
  image_url     text,
  added_by      uuid references profiles(profile_id) not null,
  status        text not null default 'inbox',  -- 'inbox' | 'top10' | 'done'
  rank          double precision,       -- fractional rank within category's
                                         -- Top 10; see Top 10 ranking below.
                                         -- null when status != 'top10'
  created_at    timestamptz default now(),
  done_at       timestamptz,
  photo_url     text,                   -- memory photo, set at done time
  rating        smallint,               -- 1-5, set at done time
  would_repeat  boolean
  -- (gifts columns revealed_at / is_private are paused: see "Paused: Gifts")
)
```

**Top 10 ranking**: use a fractional `rank` (e.g. new item between ranks 1
and 2 gets 1.5) instead of integer positions, so reordering one item only
ever updates that one row, not every row after it. Re-normalize to clean
integers periodically (e.g. a scheduled function) if ranks ever get too
close together to insert between.

**Identity per session**: on launch the app signs in anonymously, reads the
two `profiles` rows, and either shows the picker (first launch, or after
"Switch") or reuses the `profile_id` remembered on this device (AsyncStorage;
a stale id that matches no profile falls back to the picker). The acting
profile lives in React state and is sent as `added_by` on new ideas. There is no claim step, no `claimed_by`, and no
server-side notion of "this device is person X".

**Access model / RLS** (write the real SQL at build time). With Gifts
paused there are no per-user or per-category visibility rules. Policies on
every table (`pairs`, `profiles`, `ideas`, storage) are the basic check:
the request must come from an authenticated (anonymous-auth) session, and
rows are scoped by `pair_id` to the single seeded pair. `profiles` is
read-only to clients (push_token aside, later); `pairs` is read-only.

**Be clear about what this protects**: because no uid is tied to a profile
or pair, RLS cannot tell your anonymous session from a stranger's. Anyone
who finds the public web URL (or pulls the anon key out of the JS bundle)
can sign in anonymously and read or write everything. `added_by` is
client-asserted, so it's a label, not a security boundary. This is an
accepted trade-off for a private two-person app: keep the URL unshared, and
note that the real protection is obscurity plus Supabase's anonymous
sign-in rate limits. If that ever isn't enough, the fix is to re-introduce
a uid↔profile link (see the previous design in the changelog), not to add
more policies. Resuming Gifts **requires** that link — see below.

## Platform-specific entry points

- **Android**: register as a native share target (Expo config plugin or a
  bare module) so "Someday Jar" appears directly in the OS share sheet from
  Instagram/Zomato/Google Maps/etc. Opens the Add Idea sheet pre-filled.
- **iOS**: ship an iOS Shortcut (built with the Shortcuts app, distributed as
  a link) that takes the shared URL and opens a custom URL scheme
  (`somedayjar://add?url=...`) into the installed PWA/web build. Document
  this limitation to the user — it's a known Apple constraint on what an
  installed web app can register for, not a bug, and it goes away entirely
  if a real native iOS app is built later with a paid developer account.

## Build order (MVP checklist)

1. **Expo Router scaffold, Supabase init, anonymous auth, identity
   picker.** Silent `signInAnonymously()` on launch; a "Who's opening the
   app?" picker (first launch / after Switch; choice remembered locally) sets the acting
   `profile_id`. `pairs` and the two `profiles` rows are seeded by hand in
   Supabase — no invite codes, no pairing, no claim flow. Write basic RLS
   for `pairs` and `profiles`. *(In progress — this is the current step.)*
2. `ideas` table + basic RLS (authenticated + pair scoping only)
3. Add Idea (manual entry first, smart-paste second)
4. Category Detail: All Ideas list, then Top 10 + drag reorder (fractional
   ranks) + edit/delete
5. Swipe-to-done → Mark as Done sheet → writes photo/rating/repeat; undo-done
   from a Memory Lane ticket
6. Memory Lane
7. Your Lists (grid + carousel)
8. Home (Jar) — decorative, build last since it's pure polish
9. Android share-sheet integration
10. iOS Shortcut
11. Settings (profiles, notification cadence, backup/export) / heart-icon
    entry point

(Gifts was step 9 — paused, see below.)

## Paused: Gifts (resume later)

Not built, not in the categories list, screen inventory or build order. The
design is preserved here so it can be picked up without redesign.

- **Concept**: a separate, sealed category. Each partner can only ever see
  gift ideas *they* added — no count, no placeholder, nothing — until it's
  revealed. Must be enforced in the database, not just hidden in the UI.
- **Columns to add to `ideas`**: `revealed_at timestamptz` (null = still
  sealed) and `is_private boolean default false` (true until revealed).
- **Sealed-visibility RLS**: on `ideas`, when `category = 'gifts'` and
  `is_private = true` and `revealed_at is null`, the row is visible **only**
  when `added_by` is the caller's own profile. This must be a `USING` clause
  on the `SELECT` policy — a client-side filter is not real privacy.
- **Reveal flow**: only the person who *didn't* add the gift can reveal it,
  via a "reveal a gift" action in the Gifts screen — a button that surfaces
  one sealed gift at random, confirms "reveal this now?", then flips it
  visible to both. Once revealed it behaves like a normal idea (Top 10,
  mark done). Because RLS hides sealed rows from the revealer, this needs a
  `SECURITY DEFINER` function (pick-random + set `revealed_at`) rather than
  a client-side select.
- **Prerequisite — the current identity design can't support this**: sealed
  visibility needs the server to know which profile the caller is, and the
  per-launch picker is client-asserted (anyone could pick the other name, or
  call the API directly). Resuming Gifts means re-introducing a durable
  uid↔profile link (the earlier `claimed_by` + `claim_profile` design, see
  changelog) or some other real per-person credential. Without it, the gift
  rule is decorative.
- **UI**: Gifts tile on Your Lists reads "sealed until it's time" (pink,
  present in the approved design PNG); Gifts screen is a sealed variant of
  Category Detail. Category was in the original list as the 15th.

## Explicitly out of scope for MVP

Push notification nudges, full-text search, both-want-it voting/hearts,
home-screen widgets, user-creatable categories, dark mode, offline-first
conflict resolution beyond last-write-wins, native iOS app (pending a paid
Apple Developer account), Gifts (paused).

## Open decisions still to make

- Whether link-preview fetching needs a paid API or a simple self-hosted
  OG-tag scraper is enough for Instagram/Zomato/Maps links (some of these
  sites block server-side scraping more aggressively than others — may need
  per-source handling)
- Whether to eventually pursue a real native iOS app (requires a paid Apple
  Developer account) or stay on the web/PWA + Shortcut workaround for
  Person B indefinitely
- Exact wording/UX of the "swap out one to make room" Top 10-full prompt

## Development environment note

If this repo lives inside a OneDrive-synced folder, exclude it (or at least
`node_modules`) from sync — OneDrive trying to sync tens of thousands of
small files will be slow and can corrupt the sync state. Add a `.gitignore`
covering `node_modules`, `.expo`, and build output either way.

## Changelog

- Switched backend from Firebase to Supabase: avoids the Blaze
  (pay-as-you-go) plan Firebase Cloud Functions require even at low usage,
  avoids `react-native-firebase`'s incompatibility with Expo Go and web, and
  uses RLS instead of Firestore security rules for the gifts privacy
  enforcement (RLS can reference sibling columns on the same row directly,
  which is what the private-until-revealed logic needs).
- Dropped passwordless email-link auth as the default — it relied on
  Firebase Dynamic Links, which Google shut down. (Email/password was then
  the default; it has since been removed too — see the next entry.)
- Replaced all email/password auth, the login screen and the invite-code
  pairing flow with Supabase anonymous auth plus a one-time local "Which of
  you is this?" claim. The app is only ever used by two known people, so
  credentials and pairing were pure friction. `pairs` and `profiles` are
  seeded by hand; `profiles` now has its own `profile_id` primary key and a
  nullable unique `claimed_by` holding the device's anonymous `auth.uid()`,
  instead of using `auth.uid()` as the key, so data survives a device
  losing its anonymous session. RLS still keys off `auth.uid()` (via
  `claimed_by`), which keeps the gifts privacy rule enforced in the
  database. Trade-off: the claim is unauthenticated, so claim both profiles
  right after setup (see "Residual risk" under Data model).
- Simplified identity and paused Gifts. Removed `claim_profile`,
  `claimed_by` and the one-time per-device claim; replaced with a "Who's
  opening the app?" picker on every launch whose choice lives in memory only
  and sets the acting `profile_id`. Anonymous auth stays, but only to give
  requests an authenticated JWT. `profiles` is now just `profile_id`,
  `pair_id`, `display_label` (+ `push_token`). Gifts was the only feature
  needing real per-user privacy, so pausing it lets RLS stay at
  authenticated + pair scoping. Consequence, stated plainly: RLS can no
  longer distinguish the two of you from a stranger holding the public URL,
  so protection is obscurity plus rate limits (see "Access model"). The
  gifts design, columns and reveal flow are preserved under "Paused: Gifts",
  with the note that resuming it requires a uid↔profile link again.
- Added the gift-reveal flow, Top 10 cap/swap behavior, fractional ranking,
  and edit/delete/undo-done, none of which were specified in the first draft.
- Clarified the heart icon's purpose (Settings entry point) and removed the
  "Surprise us" button, which isn't in the approved design.
- Corrected the iPhone distribution assumption: sideloading isn't a durable
  option without a paid Apple account; defaulted Person B to the web/PWA
  build instead.
- Marked the in-file category color palette as superseded by the design
  canvas/PNGs rather than trying to keep both in sync by hand.
- Identity choice is now remembered on the device (AsyncStorage) instead of memory-only: the picker shows on first launch and after a "Not X? Switch" link on the home screen, not on every launch. Requested by the user; reverses the earlier memory-only rule. The server still has no notion of who a device is.
