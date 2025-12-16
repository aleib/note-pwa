import { useLiveQuery } from "dexie-react-hooks";
import type { Note, NoteFolder, Task, TaskList, Transcript } from "../domain/types";
import { db } from "./db";

export function useTaskLists(): TaskList[] | undefined {
  return useLiveQuery(() => db.taskLists.orderBy("name").toArray(), []);
}

export function useTasks(): Task[] | undefined {
  return useLiveQuery(() => db.tasks.orderBy("createdAt").reverse().toArray(), []);
}

export function useNoteFolders(): NoteFolder[] | undefined {
  return useLiveQuery(() => db.noteFolders.orderBy("name").toArray(), []);
}

export function useNotes(): Note[] | undefined {
  return useLiveQuery(() => db.notes.orderBy("createdAt").reverse().toArray(), []);
}

export function useTranscripts(): Transcript[] | undefined {
  return useLiveQuery(() => db.transcripts.orderBy("createdAt").reverse().toArray(), []);
}


