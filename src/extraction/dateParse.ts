type ParsedDate = {
  isoDate: string; // YYYY-MM-DD
  confidence: number;
};

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

const weekdayIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function nextWeekday(from: Date, targetDow: number, forceNextWeek: boolean) {
  const currentDow = from.getDay();
  let delta = (targetDow - currentDow + 7) % 7;
  if (delta === 0) delta = 7;
  if (forceNextWeek) delta += 7;
  return addDays(from, delta);
}

/**
 * Best-effort date parsing for Phase 1.
 * We intentionally keep this conservative: it's better to miss than to mis-schedule.
 */
export function parseDueDate(text: string, now: Date = new Date()): ParsedDate | null {
  const t = text.toLowerCase();

  if (/\btoday\b/.test(t)) return { isoDate: toIsoDate(now), confidence: 0.9 };
  if (/\btomorrow\b/.test(t)) return { isoDate: toIsoDate(addDays(now, 1)), confidence: 0.9 };
  if (/\bnext week\b/.test(t)) return { isoDate: toIsoDate(addDays(now, 7)), confidence: 0.6 };

  const weekdayMatch = t.match(/\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (weekdayMatch) {
    const forceNextWeek = Boolean(weekdayMatch[1]);
    const dayName = weekdayMatch[2];
    const targetDow = weekdayIndex[dayName];
    const date = nextWeekday(now, targetDow, forceNextWeek);
    return { isoDate: toIsoDate(date), confidence: forceNextWeek ? 0.7 : 0.8 };
  }

  return null;
}


