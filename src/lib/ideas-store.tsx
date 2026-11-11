import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useSession } from './session';
import { supabase } from './supabase';

export type Idea = {
  id: string;
  category: string;
  title: string;
  note?: string;
  sourceUrl?: string;
  byMe: boolean;
  status: 'inbox' | 'top10' | 'done';
  rank: number | null;
  // Set when marked done. photoUri is a local uri until uploaded, then the public URL.
  doneAt?: number;
  rating?: number;
  wouldRepeat?: boolean;
  photoUri?: string;
};

export type DoneFeedback = { rating: number; wouldRepeat: boolean; photoUri?: string };

export const TOP_CAP = 10;

type Row = {
  id: string;
  category: string;
  title: string;
  note: string | null;
  source_url: string | null;
  added_by: string;
  status: Idea['status'];
  rank: number | null;
  done_at: string | null;
  photo_url: string | null;
  rating: number | null;
  would_repeat: boolean | null;
};

const COLUMNS = 'id, category, title, note, source_url, added_by, status, rank, done_at, photo_url, rating, would_repeat';

const fromRow = (r: Row, myId: string): Idea => ({
  id: r.id,
  category: r.category,
  title: r.title,
  note: r.note ?? undefined,
  sourceUrl: r.source_url ?? undefined,
  byMe: r.added_by === myId,
  status: r.status,
  rank: r.rank,
  doneAt: r.done_at ? Date.parse(r.done_at) : undefined,
  rating: r.rating ?? undefined,
  wouldRepeat: r.would_repeat ?? undefined,
  photoUri: r.photo_url ?? undefined,
});

const isRemote = (uri: string) => /^https?:\/\//i.test(uri);
const isTemp = (id: string) => id.startsWith('tmp-');

type Status = 'loading' | 'ready' | 'error';

type Store = {
  ideas: Idea[];
  status: Status;
  reload: () => void;
  top10: (category: string) => Idea[];
  inbox: (category: string) => Idea[];
  add: (idea: { category: string; title: string; note?: string; sourceUrl?: string }) => void;
  update: (id: string, patch: { category: string; title: string; note?: string }) => void;
  // dropId is required when the Top 10 is already full: that idea returns to All Ideas.
  promote: (id: string, dropId?: string) => void;
  demote: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
  remove: (id: string) => void;
  markDone: (id: string, feedback: DoneFeedback) => void;
  // Deletes the memory and returns the idea to its Top 10 (inbox if that filled up meanwhile).
  undoDone: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function IdeasProvider({ children }: { children: ReactNode }) {
  const { profile } = useSession();
  const [ideas, setIdeasState] = useState<Idea[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const ref = useRef<Idea[]>([]); // latest ideas, readable synchronously by the writers below
  const inFlight = useRef(0); // local writes in progress; remote refetches wait for them
  const dirty = useRef(false);

  const setIdeas = useCallback((next: Idea[]) => {
    ref.current = next;
    setIdeasState(next);
  }, []);

  const load = useCallback(async () => {
    if (!profile) return;
    if (inFlight.current > 0) {
      dirty.current = true;
      return;
    }
    const { data, error } = await supabase.from('ideas').select(COLUMNS).eq('pair_id', profile.pair_id);
    if (error || !data) {
      console.warn('Loading ideas failed:', error?.message);
      return setStatus('error');
    }
    setIdeas((data as Row[]).map((r) => fromRow(r, profile.profile_id)));
    setStatus('ready');
  }, [profile, setIdeas]);

  const reload = useCallback(() => {
    setStatus('loading');
    load();
  }, [load]);

  useEffect(() => {
    if (!profile) {
      setIdeas([]);
      return;
    }
    setStatus('loading');
    load();
    // Live updates from the other phone (and echoes of our own writes, which load() defers).
    const channel = supabase
      .channel('ideas-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, load, setIdeas]);

  // Upload a freshly picked photo and return its public URL.
  const uploadPhoto = useCallback(
    async (ideaId: string, uri: string) => {
      const body = await (await fetch(uri)).arrayBuffer();
      const path = `${profile!.pair_id}/${ideaId}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('memories').upload(path, body, { contentType: 'image/jpeg' });
      if (error) throw error;
      return supabase.storage.from('memories').getPublicUrl(path).data.publicUrl;
    },
    [profile],
  );

  // Writes the difference between two snapshots. Rows leaving Top 10 go first so the
  // database's 10-per-category cap never trips on a swap.
  const sync = useCallback(
    async (prev: Idea[], next: Idea[]) => {
      const before = new Map(prev.map((i) => [i.id, i]));
      const after = new Map(next.map((i) => [i.id, i]));

      for (const old of prev) {
        if (!after.has(old.id) && !isTemp(old.id)) {
          const { error } = await supabase.from('ideas').delete().eq('id', old.id);
          if (error) throw error;
        }
      }

      const changed = next
        .filter((i) => !isTemp(i.id) && before.has(i.id) && JSON.stringify(before.get(i.id)) !== JSON.stringify(i))
        .sort((a, b) => Number(a.status === 'top10') - Number(b.status === 'top10'));

      for (const i of changed) {
        let photo = i.photoUri ?? null;
        if (photo && !isRemote(photo)) {
          photo = await uploadPhoto(i.id, photo);
          setIdeas(ref.current.map((x) => (x.id === i.id ? { ...x, photoUri: photo! } : x)));
        }
        const { error } = await supabase
          .from('ideas')
          .update({
            category: i.category,
            title: i.title,
            note: i.note ?? null,
            status: i.status,
            rank: i.rank,
            done_at: i.doneAt ? new Date(i.doneAt).toISOString() : null,
            photo_url: photo,
            rating: i.rating ?? null,
            would_repeat: i.wouldRepeat ?? null,
          })
          .eq('id', i.id);
        if (error) throw error;
      }
    },
    [uploadPhoto, setIdeas],
  );

  // Optimistic: show the change now, write in the background, and fall back to the
  // server's truth if the write fails.
  const apply = useCallback(
    (fn: (all: Idea[]) => Idea[]) => {
      const prev = ref.current;
      const next = fn(prev);
      if (next === prev) return;
      setIdeas(next);
      inFlight.current++;
      sync(prev, next)
        .catch((e) => {
          console.warn('Saving failed:', e?.message ?? e);
          dirty.current = true;
        })
        .finally(() => {
          inFlight.current--;
          if (inFlight.current === 0 && dirty.current) {
            dirty.current = false;
            load();
          }
        });
    },
    [sync, load, setIdeas],
  );

  const top10 = useCallback(
    (category: string) =>
      ideas.filter((i) => i.category === category && i.status === 'top10').sort((a, b) => a.rank! - b.rank!),
    [ideas],
  );
  const inbox = useCallback((category: string) => ideas.filter((i) => i.category === category && i.status === 'inbox'), [ideas]);

  const store = useMemo<Store>(
    () => ({
      ideas,
      status,
      reload,
      top10,
      inbox,
      // New ideas always land in the inbox; nothing is auto-promoted.
      add: (idea) => {
        if (!profile) return;
        const tempId = `tmp-${Date.now()}-${ref.current.length}`;
        setIdeas([...ref.current, { ...idea, id: tempId, byMe: true, status: 'inbox', rank: null }]);
        inFlight.current++;
        (async () => {
          try {
            const { data, error } = await supabase
              .from('ideas')
              .insert({
                pair_id: profile.pair_id,
                added_by: profile.profile_id,
                category: idea.category,
                title: idea.title,
                note: idea.note ?? null,
                source_url: idea.sourceUrl ?? null,
              })
              .select('id')
              .single();
            if (error || !data) throw error ?? new Error('no row returned');
            setIdeas(ref.current.map((i) => (i.id === tempId ? { ...i, id: data.id } : i)));
          } catch (e: any) {
            console.warn('Adding idea failed:', e?.message ?? e);
            dirty.current = true;
          } finally {
            inFlight.current--;
            if (inFlight.current === 0 && dirty.current) {
              dirty.current = false;
              load();
            }
          }
        })();
      },
      // Changing category sends a Top 10 idea back to the inbox (its rank belonged to the old list).
      update: (id, patch) =>
        apply((all) =>
          all.map((i) =>
            i.id !== id
              ? i
              : i.category === patch.category
                ? { ...i, ...patch }
                : { ...i, ...patch, status: 'inbox', rank: null },
          ),
        ),
      promote: (id, dropId) =>
        apply((all) => {
          const target = all.find((i) => i.id === id);
          if (!target) return all;
          const ranks = all.filter((i) => i.category === target.category && i.status === 'top10' && i.id !== dropId);
          if (ranks.length >= TOP_CAP) return all;
          const next = ranks.length ? Math.max(...ranks.map((i) => i.rank!)) + 1 : 1;
          return all.map((i) =>
            i.id === id
              ? { ...i, status: 'top10', rank: next }
              : i.id === dropId
                ? { ...i, status: 'inbox', rank: null }
                : i,
          );
        }),
      demote: (id) => apply((all) => all.map((i) => (i.id === id ? { ...i, status: 'inbox', rank: null } : i))),
      // Fractional rank: moving one row only rewrites that row.
      move: (id, dir) =>
        apply((all) => {
          const me = all.find((i) => i.id === id);
          if (!me) return all;
          const list = all
            .filter((i) => i.category === me.category && i.status === 'top10')
            .sort((a, b) => a.rank! - b.rank!);
          const at = list.findIndex((i) => i.id === id);
          const to = at + dir;
          if (to < 0 || to >= list.length) return all;
          const a = dir === -1 ? list[to - 1]?.rank : list[to].rank;
          const b = dir === -1 ? list[to].rank! : list[to + 1]?.rank;
          const rank = a == null ? b! - 1 : b == null ? a + 1 : (a + b) / 2;
          return all.map((i) => (i.id === id ? { ...i, rank } : i));
        }),
      remove: (id) => apply((all) => all.filter((i) => i.id !== id)),
      markDone: (id, f) =>
        apply((all) =>
          all.map((i) => (i.id === id ? { ...i, ...f, status: 'done', rank: null, doneAt: Date.now() } : i)),
        ),
      undoDone: (id) =>
        apply((all) => {
          const me = all.find((i) => i.id === id);
          if (!me) return all;
          const ranks = all.filter((i) => i.category === me.category && i.status === 'top10').map((i) => i.rank!);
          const back = ranks.length < TOP_CAP;
          return all.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: back ? 'top10' : 'inbox',
                  rank: back ? (ranks.length ? Math.max(...ranks) + 1 : 1) : null,
                  doneAt: undefined,
                  rating: undefined,
                  wouldRepeat: undefined,
                  photoUri: undefined,
                }
              : i,
          );
        }),
    }),
    [ideas, status, reload, top10, inbox, apply, load, profile, setIdeas],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useIdeas() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useIdeas must be used inside IdeasProvider');
  return v;
}
