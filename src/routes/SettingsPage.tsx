import { useState } from "react";
import { useSettingsStore } from "../state/settingsStore";
import { deleteAllLocalData, deleteAllTranscripts } from "../storage/repo";

export function SettingsPage() {
  const aggressiveExtraction = useSettingsStore((s) => s.aggressiveExtraction);
  const setAggressiveExtraction = useSettingsStore((s) => s.setAggressiveExtraction);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDeleteTranscripts() {
    const ok = window.confirm("Delete all transcripts? This cannot be undone.");
    if (!ok) return;

    setIsWorking(true);
    setError(null);
    try {
      await deleteAllTranscripts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transcripts");
    } finally {
      setIsWorking(false);
    }
  }

  async function onDeleteAllData() {
    const ok = window.confirm("Delete ALL local data (tasks, notes, lists, folders, transcripts)? This cannot be undone.");
    if (!ok) return;

    setIsWorking(true);
    setError(null);
    try {
      await deleteAllLocalData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete local data");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-slate-300">Tune how aggressively we extract items from your transcript.</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-800 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Aggressive extraction</div>
            <div className="text-sm text-slate-300">
              When enabled, a single recording can create multiple tasks/notes.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAggressiveExtraction(!aggressiveExtraction)}
            className={[
              "relative h-7 w-12 rounded-full border transition",
              aggressiveExtraction ? "border-emerald-400 bg-emerald-500" : "border-slate-700 bg-slate-900"
            ].join(" ")}
            aria-label={aggressiveExtraction ? "Disable aggressive extraction" : "Enable aggressive extraction"}
          >
            <span
              className={[
                "absolute top-0.5 size-6 rounded-full bg-slate-950 transition",
                aggressiveExtraction ? "left-[22px]" : "left-0.5"
              ].join(" ")}
            />
          </button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 p-4">
        <div className="text-sm font-semibold">Danger zone</div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => void onDeleteTranscripts()}
            disabled={isWorking}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 disabled:opacity-50"
          >
            Delete all transcripts
          </button>
          <button
            type="button"
            onClick={() => void onDeleteAllData()}
            disabled={isWorking}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 disabled:opacity-50"
          >
            Delete all local data
          </button>
        </div>
        <div className="text-xs text-slate-400">
          These actions affect only this device/browser profile. There is no sync or recovery.
        </div>
      </section>
    </div>
  );
}


