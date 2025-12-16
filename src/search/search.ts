type Scored<T> = { item: T; score: number };

function normalize(s: string) {
  return s.toLowerCase().trim();
}

/**
 * Very small “fuzzy enough” matcher for Phase 1.
 * Intent: predictable behavior over clever ranking.
 */
export function scoreTextMatch(haystack: string, query: string): number {
  const h = normalize(haystack);
  const q = normalize(query);
  if (!q) return 0;
  if (!h) return 0;

  if (h === q) return 1;
  if (h.startsWith(q)) return 0.95;
  if (h.includes(q)) return 0.85;

  const tokens = q.split(/\s+/g).filter(Boolean);
  if (tokens.length === 0) return 0;

  let hits = 0;
  for (const token of tokens) {
    if (h.includes(token)) hits += 1;
  }

  const ratio = hits / tokens.length;
  return ratio >= 0.5 ? 0.4 + ratio * 0.4 : 0;
}

export function topMatches<T>(items: T[], query: string, toText: (item: T) => string, limit = 50): Scored<T>[] {
  const scored: Scored<T>[] = [];
  for (const item of items) {
    const score = scoreTextMatch(toText(item), query);
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}


