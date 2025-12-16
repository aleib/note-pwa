import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ExtractedNoteDraft, ExtractedTaskDraft } from "../extraction/ExtractionEngine";
import { useReviewStore } from "../state/reviewStore";
import { useNoteFolders, useTaskLists } from "../storage/live";
import { createNote, createTask, createTranscript } from "../storage/repo";

function clampConfidence(confidence: number) {
  return Math.max(0, Math.min(1, confidence));
}

function confidenceLabel(confidence: number) {
  const c = clampConfidence(confidence);
  if (c >= 0.8) return "high";
  if (c >= 0.65) return "medium";
  return "low";
}

function TaskCard(props: {
  task: ExtractedTaskDraft;
  listOptions: { id: string; name: string }[];
  onUpdate: (patch: Partial<ExtractedTaskDraft>) => void;
  onDelete: () => void;
}) {
  const { task, listOptions, onUpdate, onDelete } = props;
  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 p-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs text-slate-400">Task · {confidenceLabel(task.confidence)} confidence</div>
        <button type="button" onClick={onDelete} className="text-xs font-semibold text-rose-300">
          Delete
        </button>
      </div>
      <input
        value={task.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-600"
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">List</div>
          <select
            value={task.listId}
            onChange={(e) => onUpdate({ listId: e.target.value })}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 text-sm outline-none focus:border-slate-600"
          >
            {listOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Due date</div>
          <input
            type="date"
            value={task.dueDate ?? ""}
            onChange={(e) => onUpdate({ dueDate: e.target.value || undefined })}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-600"
          />
        </div>
      </div>
    </div>
  );
}

function NoteCard(props: {
  note: ExtractedNoteDraft;
  folderOptions: { id: string; name: string }[];
  onUpdate: (patch: Partial<ExtractedNoteDraft>) => void;
  onDelete: () => void;
}) {
  const { note, folderOptions, onUpdate, onDelete } = props;
  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 p-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs text-slate-400">Note · {confidenceLabel(note.confidence)} confidence</div>
        <button type="button" onClick={onDelete} className="text-xs font-semibold text-rose-300">
          Delete
        </button>
      </div>
      <input
        value={note.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-600"
      />
      <textarea
        value={note.body}
        onChange={(e) => onUpdate({ body: e.target.value })}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-600"
      />
      <div className="space-y-1">
        <div className="text-xs text-slate-400">Folder</div>
        <select
          value={note.folderId}
          onChange={(e) => onUpdate({ folderId: e.target.value })}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 text-sm outline-none focus:border-slate-600"
        >
          {folderOptions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ReviewPage() {
  const navigate = useNavigate();
  const session = useReviewStore((s) => s.session);
  const clearSession = useReviewStore((s) => s.clearSession);
  const updateTask = useReviewStore((s) => s.updateTask);
  const deleteTask = useReviewStore((s) => s.deleteTask);
  const updateNote = useReviewStore((s) => s.updateNote);
  const deleteNote = useReviewStore((s) => s.deleteNote);

  const taskLists = useTaskLists();
  const folders = useNoteFolders();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listOptions = useMemo(() => taskLists ?? [], [taskLists]);
  const folderOptions = useMemo(() => folders ?? [], [folders]);

  async function onConfirmAll() {
    if (!session) return;

    setIsSaving(true);
    setError(null);
    try {
      const transcript = await createTranscript(session.transcriptText);

      // Persist only what the user kept after review.
      await Promise.all([
        ...session.tasks.map((t) =>
          createTask({
            title: t.title.trim() || "Untitled task",
            notes: t.notes,
            dueDate: t.dueDate,
            priority: t.priority,
            completed: false,
            listId: t.listId,
            tags: t.tags,
            sourceTranscriptId: transcript.id
          })
        ),
        ...session.notes.map((n) =>
          createNote({
            title: n.title.trim() || "Untitled",
            body: n.body,
            folderId: n.folderId,
            tags: n.tags,
            sourceTranscriptId: transcript.id
          })
        )
      ]);

      clearSession();
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  if (!session) {
    return (
      <div className="space-y-3">
        <h1 className="text-lg font-semibold">Review</h1>
        <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">
          No pending review session. Record something first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Review</h1>
        <p className="text-sm text-slate-300">Nothing is saved until you confirm.</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="space-y-2">
        <div className="text-sm font-semibold">Transcript</div>
        <div className="max-h-48 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
          <pre className="whitespace-pre-wrap font-sans">{session.transcriptText}</pre>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold">Tasks</div>
          <div className="text-xs text-slate-400">{session.tasks.length}</div>
        </div>
        {listOptions.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">Loading lists…</div>
        ) : session.tasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">No tasks extracted.</div>
        ) : (
          <div className="space-y-2">
            {session.tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                listOptions={listOptions}
                onUpdate={(patch) => updateTask(t.id, patch)}
                onDelete={() => deleteTask(t.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-semibold">Notes</div>
          <div className="text-xs text-slate-400">{session.notes.length}</div>
        </div>
        {folderOptions.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">Loading folders…</div>
        ) : session.notes.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">No notes extracted.</div>
        ) : (
          <div className="space-y-2">
            {session.notes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                folderOptions={folderOptions}
                onUpdate={(patch) => updateNote(n.id, patch)}
                onDelete={() => deleteNote(n.id)}
              />
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => void onConfirmAll()}
        disabled={isSaving}
        className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-base font-semibold text-slate-950 disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Confirm All"}
      </button>
    </div>
  );
}


