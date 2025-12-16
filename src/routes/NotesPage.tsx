import { useMemo, useState } from "react";
import type { Id, Note } from "../domain/types";
import { createNote } from "../storage/repo";
import { useNoteFolders, useNotes } from "../storage/live";

const MANUAL_SOURCE_TRANSCRIPT_ID = "manual";

function groupByFolderId(notes: Note[]) {
  const byFolderId = new Map<Id, Note[]>();
  for (const note of notes) {
    const existing = byFolderId.get(note.folderId);
    if (existing) existing.push(note);
    else byFolderId.set(note.folderId, [note]);
  }
  return byFolderId;
}

export function NotesPage() {
  const folders = useNoteFolders();
  const notes = useNotes();
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const defaultFolderId = folders?.[0]?.id ?? null;

  const notesByFolderId = useMemo(() => {
    return groupByFolderId(notes ?? []);
  }, [notes]);

  async function onAddNote() {
    const title = newTitle.trim();
    const body = newBody.trim();
    if (!defaultFolderId || (!title && !body)) return;

    setIsSaving(true);
    try {
      await createNote({
        title: title || "Untitled",
        body: body || "",
        folderId: defaultFolderId,
        sourceTranscriptId: MANUAL_SOURCE_TRANSCRIPT_ID
      });
      setNewTitle("");
      setNewBody("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Notes</h1>
        <p className="text-sm text-slate-300">Stored locally on this device.</p>
      </header>

      <section className="space-y-2 rounded-2xl border border-slate-800 p-3">
        <div className="text-sm font-semibold">Quick add</div>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={defaultFolderId ? "Title (optional)" : "Loading folders..."}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-slate-600"
        />
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Body (optional)"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-slate-600"
        />
        <button
          type="button"
          onClick={() => void onAddNote()}
          disabled={!defaultFolderId || (!newTitle.trim() && !newBody.trim()) || isSaving}
          className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          Add note
        </button>
      </section>

      {folders && notes ? (
        <div className="space-y-4">
          {folders.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">No folders yet.</div>
          ) : (
            folders.map((folder) => {
              const folderNotes = notesByFolderId.get(folder.id) ?? [];
              return (
                <section key={folder.id} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-semibold">{folder.name}</div>
                    <div className="text-xs text-slate-400">{folderNotes.length} notes</div>
                  </div>

                  {folderNotes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">
                      Nothing here yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {folderNotes.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-slate-800 p-3">
                          <div className="font-medium">{note.title}</div>
                          {note.body ? (
                            <div className="mt-1 text-sm text-slate-300">
                              {note.body.length > 140 ? `${note.body.slice(0, 140)}…` : note.body}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">Loading…</div>
      )}
    </div>
  );
}



