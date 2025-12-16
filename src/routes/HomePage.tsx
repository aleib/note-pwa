import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">note</h1>
        <p className="text-sm text-slate-300">Voice-first tasks & notes. Offline-first. No backend.</p>
      </header>

      <Link
        to="/record"
        className="block rounded-2xl bg-emerald-500 px-4 py-5 text-center text-base font-semibold text-slate-950"
      >
        Record
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/tasks" className="rounded-2xl border border-slate-800 px-4 py-4 text-center">
          Tasks
        </Link>
        <Link to="/notes" className="rounded-2xl border border-slate-800 px-4 py-4 text-center">
          Notes
        </Link>
        <Link to="/search" className="rounded-2xl border border-slate-800 px-4 py-4 text-center">
          Search
        </Link>
        <Link to="/settings" className="rounded-2xl border border-slate-800 px-4 py-4 text-center">
          Settings
        </Link>
      </div>
    </div>
  );
}


