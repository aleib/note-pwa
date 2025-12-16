import type { ExtractionEngine, ExtractionOptions, ExtractionResult, ExtractedNoteDraft, ExtractedTaskDraft } from "./ExtractionEngine";
import { parseDueDate } from "./dateParse";

type Intent = "task" | "note";

const taskPhrases = [
  "remind me to",
  "i need to",
  "i have to",
  "i should",
  "todo",
  "to do"
];

const taskVerbs = [
  "call",
  "email",
  "text",
  "message",
  "buy",
  "pick up",
  "schedule",
  "book",
  "cancel",
  "pay",
  "renew",
  "send",
  "submit",
  "order"
];

const notePhrases = ["note that", "remember that", "fyi", "idea", "thought"];

const tagKeywords: Record<string, string[]> = {
  home: ["home", "house", "apartment"],
  work: ["work", "office", "project", "meeting"],
  shopping: ["buy", "order", "shopping", "grocery", "groceries"],
  health: ["doctor", "dentist", "gym", "workout"],
  finance: ["pay", "invoice", "bill", "tax"]
};

function uuid() {
  return crypto.randomUUID();
}

function normalizeSegment(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function splitIntoSegments(text: string, aggressive: boolean) {
  const normalized = text.replace(/\n+/g, ". ");
  const sentences = normalized
    .split(/(?<=[.!?])\s+/g)
    .map((s) => normalizeSegment(s))
    .filter(Boolean);

  if (!aggressive) return sentences;

  const segments: string[] = [];
  for (const sentence of sentences) {
    const parts = sentence
      .split(/\b(?:and then|then|also)\b/gi)
      .map((s) => normalizeSegment(s))
      .filter(Boolean);
    segments.push(...parts);
  }
  return segments;
}

function inferTags(segment: string) {
  const t = segment.toLowerCase();
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((kw) => t.includes(kw))) tags.push(tag);
  }
  return tags.length ? tags : undefined;
}

function inferIntent(segment: string): { intent: Intent; confidence: number } {
  const t = segment.toLowerCase();

  if (notePhrases.some((p) => t.includes(p))) return { intent: "note", confidence: 0.85 };
  if (taskPhrases.some((p) => t.includes(p))) return { intent: "task", confidence: 0.85 };
  if (taskVerbs.some((v) => t.startsWith(v + " ") || t.includes(` ${v} `))) return { intent: "task", confidence: 0.7 };

  // Default: prefer note to avoid accidental task spam.
  return { intent: "note", confidence: 0.55 };
}

function taskTitleFrom(segment: string) {
  const s = normalizeSegment(segment);
  const lowered = s.toLowerCase();

  for (const prefix of taskPhrases) {
    const idx = lowered.indexOf(prefix);
    if (idx >= 0) {
      const tail = s.slice(idx + prefix.length).trim();
      if (tail) return tail;
    }
  }

  return s;
}

function noteTitleFrom(segment: string) {
  const s = normalizeSegment(segment);
  if (s.length <= 40) return s;
  return `${s.slice(0, 40).trim()}…`;
}

export const rulesEngine: ExtractionEngine = {
  extract(text: string, options: ExtractionOptions): ExtractionResult {
    const segments = splitIntoSegments(text, options.aggressive);

    const tasks: ExtractedTaskDraft[] = [];
    const notes: ExtractedNoteDraft[] = [];

    for (const segment of segments) {
      const { intent, confidence } = inferIntent(segment);
      const tags = inferTags(segment);
      const due = parseDueDate(segment);

      if (intent === "task") {
        tasks.push({
          id: uuid(),
          confidence,
          title: taskTitleFrom(segment),
          dueDate: due?.isoDate,
          listId: options.defaultTaskListId,
          tags
        });
      } else {
        notes.push({
          id: uuid(),
          confidence,
          title: noteTitleFrom(segment),
          body: normalizeSegment(segment),
          folderId: options.defaultNoteFolderId,
          tags
        });
      }
    }

    return { tasks, notes };
  }
};


