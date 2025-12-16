import { useMemo, useState } from "react";
import type { Id, Task } from "../domain/types";
import { createTask, updateTask } from "../storage/repo";
import { useTaskLists, useTasks } from "../storage/live";

const MANUAL_SOURCE_TRANSCRIPT_ID = "manual";

function groupByListId(tasks: Task[]) {
  const byListId = new Map<Id, Task[]>();
  for (const task of tasks) {
    const existing = byListId.get(task.listId);
    if (existing) existing.push(task);
    else byListId.set(task.listId, [task]);
  }
  return byListId;
}

export function TasksPage() {
  const taskLists = useTaskLists();
  const tasks = useTasks();
  const [newTitle, setNewTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const defaultListId = taskLists?.[0]?.id ?? null;

  const tasksByListId = useMemo(() => {
    return groupByListId(tasks ?? []);
  }, [tasks]);

  async function onAddTask() {
    const title = newTitle.trim();
    if (!title || !defaultListId) return;

    setIsSaving(true);
    try {
      await createTask({
        title,
        completed: false,
        listId: defaultListId,
        sourceTranscriptId: MANUAL_SOURCE_TRANSCRIPT_ID
      });
      setNewTitle("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Tasks</h1>
        <p className="text-sm text-slate-300">Stored locally on this device.</p>
      </header>

      <section className="space-y-2 rounded-2xl border border-slate-800 p-3">
        <div className="text-sm font-semibold">Quick add</div>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={defaultListId ? "Add a task..." : "Loading lists..."}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-slate-600"
          />
          <button
            type="button"
            onClick={() => void onAddTask()}
            disabled={!defaultListId || !newTitle.trim() || isSaving}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </section>

      {taskLists && tasks ? (
        <div className="space-y-4">
          {taskLists.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">
              No task lists yet.
            </div>
          ) : (
            taskLists.map((list) => {
              const listTasks = tasksByListId.get(list.id) ?? [];
              const open = listTasks.filter((t) => !t.completed);
              const done = listTasks.filter((t) => t.completed);

              return (
                <section key={list.id} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-semibold">{list.name}</div>
                    <div className="text-xs text-slate-400">
                      {open.length} open{done.length ? ` · ${done.length} done` : ""}
                    </div>
                  </div>

                  {listTasks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 p-4 text-sm text-slate-300">
                      Nothing here yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...open, ...done].map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 rounded-2xl border border-slate-800 p-3"
                        >
                          <button
                            type="button"
                            aria-label={task.completed ? "Mark as not completed" : "Mark as completed"}
                            onClick={() => void updateTask(task.id, { completed: !task.completed })}
                            className={[
                              "mt-0.5 size-5 rounded border",
                              task.completed ? "border-emerald-400 bg-emerald-500" : "border-slate-600"
                            ].join(" ")}
                          />
                          <div className="min-w-0 flex-1">
                            <div className={task.completed ? "text-slate-400 line-through" : ""}>{task.title}</div>
                            {task.dueDate ? (
                              <div className="mt-1 text-xs text-slate-400">Due: {task.dueDate}</div>
                            ) : null}
                          </div>
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



