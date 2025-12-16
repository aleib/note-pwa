import { create } from "zustand";
import type { ExtractedNoteDraft, ExtractedTaskDraft } from "../extraction/ExtractionEngine";

export type ReviewSession = {
  transcriptText: string;
  createdAt: number;
  tasks: ExtractedTaskDraft[];
  notes: ExtractedNoteDraft[];
};

export type ReviewState = {
  session: ReviewSession | null;
};

export type ReviewActions = {
  startSession: (session: ReviewSession) => void;
  clearSession: () => void;

  updateTask: (id: string, patch: Partial<ExtractedTaskDraft>) => void;
  deleteTask: (id: string) => void;

  updateNote: (id: string, patch: Partial<ExtractedNoteDraft>) => void;
  deleteNote: (id: string) => void;
};

export const useReviewStore = create<ReviewState & ReviewActions>((set) => ({
  session: null,
  startSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),

  updateTask: (id, patch) =>
    set((s) => {
      if (!s.session) return s;
      return {
        session: {
          ...s.session,
          tasks: s.session.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
        }
      };
    }),
  deleteTask: (id) =>
    set((s) => {
      if (!s.session) return s;
      return { session: { ...s.session, tasks: s.session.tasks.filter((t) => t.id !== id) } };
    }),

  updateNote: (id, patch) =>
    set((s) => {
      if (!s.session) return s;
      return {
        session: {
          ...s.session,
          notes: s.session.notes.map((n) => (n.id === id ? { ...n, ...patch } : n))
        }
      };
    }),
  deleteNote: (id) =>
    set((s) => {
      if (!s.session) return s;
      return { session: { ...s.session, notes: s.session.notes.filter((n) => n.id !== id) } };
    })
}));


