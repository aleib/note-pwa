import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ensureDefaults } from "../storage/repo";
import { OfflineBanner } from "./OfflineBanner";
import { PrimaryNav } from "./PrimaryNav";

export function AppLayout() {
  const [fatalError, setFatalError] = useState<string | null>(null);

  useEffect(() => {
    let isAlive = true;
    void ensureDefaults().catch((err) => {
      if (!isAlive) return;
      setFatalError(err instanceof Error ? err.message : "Failed to initialize local storage");
    });
    return () => {
      isAlive = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50">
      <OfflineBanner />
      <div className="mx-auto flex w-full max-w-md flex-col">
        <main className="px-4 pb-24 pt-4">
          {fatalError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              <div className="font-semibold">Storage error</div>
              <div className="mt-1 text-rose-200/90">{fatalError}</div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        <PrimaryNav />
      </div>
    </div>
  );
}


