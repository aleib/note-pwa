import Dexie, { type Table } from "dexie";
import type { Note, NoteFolder, Task, TaskList, Transcript } from "../domain/types";

/**
 * Intent: keep the DB schema explicit and stable so we can migrate safely later.
 * Phase 1 doesn't need migrations, but we keep the structure ready for them.
 */
export class NoteDb extends Dexie {
  transcripts!: Table<Transcript, string>;
  taskLists!: Table<TaskList, string>;
  tasks!: Table<Task, string>;
  noteFolders!: Table<NoteFolder, string>;
  notes!: Table<Note, string>;

  constructor() {
    super("note-pwa");

    this.version(1).stores({
      transcripts: "id, createdAt",
      taskLists: "id, name",
      tasks: "id, listId, completed, createdAt, updatedAt, dueDate, title, notes",
      noteFolders: "id, name",
      notes: "id, folderId, createdAt, updatedAt, title, body"
    });
  }
}

export const db = new NoteDb();


