import { useMemo, useState } from "react";
import { topMatches } from "../search/search";
import { useNotes, useTasks } from "../storage/live";

export function SearchPage() {
  const tasks = useTasks();
  const notes = useNotes();
  const [query, setQuery] = useState("");

  const taskMatches = useMemo(() => {
    if (!tasks) return undefined;
    return topMatches(tasks, query, (t) => `${t.title} ${t.notes ?? ""}`);
  }, [tasks, query]);

  const noteMatches = useMemo(() => {
    if (!notes) return undefined;
    return topMatches(notes, query, (n) => `${n.title} ${n.body}`);
  }, [notes, query]);

  const hasQuery = Boolean(query.trim());

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Search</h1>
        <p className="text-sm text-slate-300">Search across tasks and notes on this device.</p>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-slate-600"
      />

      {!hasQuery ? (
        <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">Type to search.</div>
      ) : taskMatches && noteMatches ? (
        <div className="space-y-5">
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold">Tasks</div>
              <div className="text-xs text-slate-400">{taskMatches.length}</div>
            </div>
            {taskMatches.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">No matches.</div>
            ) : (
              <div className="space-y-2">
                {taskMatches.map(({ item }) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 p-3">
                    <div className="font-medium">{item.title}</div>
                    {item.notes ? <div className="mt-1 text-sm text-slate-300">{item.notes}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold">Notes</div>
              <div className="text-xs text-slate-400">{noteMatches.length}</div>
            </div>
            {noteMatches.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">No matches.</div>
            ) : (
              <div className="space-y-2">
                {noteMatches.map(({ item }) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 p-3">
                    <div className="font-medium">{item.title}</div>
                    {item.body ? (
                      <div className="mt-1 text-sm text-slate-300">
                        {item.body.length > 140 ? `${item.body.slice(0, 140)}…` : item.body}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">Loading…</div>
      )}
    </div>
  );
}



