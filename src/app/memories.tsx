import { Redirect } from 'expo-router';
import { useState } from 'react';

import { Sheet } from '@/components/Sheet';
import { TabbedPage, TITLE_OFFSET } from '@/components/TabbedPage';
import { Ticket } from '@/components/Ticket';
import { Body, Button } from '@/components/ui';
import { useIdeas, type Idea } from '@/lib/ideas-store';
import { useSession } from '@/lib/session';

export default function Memories() {
  const { profile } = useSession();
  const { ideas, undoDone } = useIdeas();
  const [undoing, setUndoing] = useState<Idea | null>(null);
  if (!profile) return <Redirect href="/" />;

  const memories = ideas.filter((i) => i.status === 'done').sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));

  return (
    <TabbedPage title="Memory Lane" subtitle="things we’ve actually gone and done." tape="#5FB3A1" titleOffset={TITLE_OFFSET} stackTape>
      {memories.length === 0 ? (
        <Body>Nothing here yet. Mark something in a Top 10 as done and it’ll show up as a ticket.</Body>
      ) : (
        memories.map((m, i) => <Ticket key={m.id} idea={m} index={i} onUndo={() => setUndoing(m)} />)
      )}

      <Sheet visible={!!undoing} title="Unmark as done?" onClose={() => setUndoing(null)}>
        <Body>This deletes the memory for “{undoing?.title}” and puts it back in its Top 10.</Body>
        <Button
          label="Unmark"
          onPress={() => {
            if (undoing) undoDone(undoing.id);
            setUndoing(null);
          }}
        />
        <Button secondary label="Keep the memory" onPress={() => setUndoing(null)} />
      </Sheet>
    </TabbedPage>
  );
}
