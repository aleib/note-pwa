import type { Id, Note, NoteFolder, Task, TaskList, Transcript } from "../domain/types";
import { db } from "./db";

export const DEFAULT_TASK_LIST_NAME = "Inbox";
export const DEFAULT_NOTE_FOLDER_NAME = "Inbox";

type EnsureDefaultsResult = {
  defaultTaskListId: Id;
  defaultNoteFolderId: Id;
};

function nowMs() {
  return Date.now();
}

function uuid() {
  return crypto.randomUUID();
}

export async function ensureDefaults(): Promise<EnsureDefaultsResult> {
  const [taskListCount, folderCount] = await Promise.all([db.taskLists.count(), db.noteFolders.count()]);

  if (taskListCount === 0) {
    await db.taskLists.add({ id: uuid(), name: DEFAULT_TASK_LIST_NAME });
  }
  if (folderCount === 0) {
    await db.noteFolders.add({ id: uuid(), name: DEFAULT_NOTE_FOLDER_NAME });
  }

  const [defaultTaskList, defaultNoteFolder] = await Promise.all([
    db.taskLists.orderBy("name").first(),
    db.noteFolders.orderBy("name").first()
  ]);

  // We intentionally throw here: having no default list/folder breaks core flows.
  if (!defaultTaskList || !defaultNoteFolder) {
    throw new Error("Failed to ensure default list/folder");
  }

  return { defaultTaskListId: defaultTaskList.id, defaultNoteFolderId: defaultNoteFolder.id };
}

export async function createTranscript(text: string): Promise<Transcript> {
  const transcript: Transcript = { id: uuid(), text, createdAt: nowMs() };
  await db.transcripts.add(transcript);
  return transcript;
}

export async function listTranscripts(): Promise<Transcript[]> {
  return db.transcripts.orderBy("createdAt").reverse().toArray();
}

export async function createTaskList(name: string): Promise<TaskList> {
  const taskList: TaskList = { id: uuid(), name };
  await db.taskLists.add(taskList);
  return taskList;
}

export async function listTaskLists(): Promise<TaskList[]> {
  return db.taskLists.orderBy("name").toArray();
}

export async function createNoteFolder(name: string): Promise<NoteFolder> {
  const noteFolder: NoteFolder = { id: uuid(), name };
  await db.noteFolders.add(noteFolder);
  return noteFolder;
}

export async function listNoteFolders(): Promise<NoteFolder[]> {
  return db.noteFolders.orderBy("name").toArray();
}

export async function createTask(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const task: Task = { ...input, id: uuid(), createdAt: nowMs(), updatedAt: nowMs() };
  await db.tasks.add(task);
  return task;
}

export async function updateTask(id: Id, patch: Partial<Omit<Task, "id" | "createdAt">>): Promise<void> {
  await db.tasks.update(id, { ...patch, updatedAt: nowMs() });
}

export async function listTasks(): Promise<Task[]> {
  return db.tasks.orderBy("createdAt").reverse().toArray();
}

export async function createNote(input: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
  const note: Note = { ...input, id: uuid(), createdAt: nowMs(), updatedAt: nowMs() };
  await db.notes.add(note);
  return note;
}

export async function updateNote(id: Id, patch: Partial<Omit<Note, "id" | "createdAt">>): Promise<void> {
  await db.notes.update(id, { ...patch, updatedAt: nowMs() });
}

export async function listNotes(): Promise<Note[]> {
  return db.notes.orderBy("createdAt").reverse().toArray();
}

export async function deleteAllTranscripts(): Promise<void> {
  await db.transcripts.clear();
}

export async function deleteAllLocalData(): Promise<void> {
  await db.delete();
  await db.open();
  await ensureDefaults();
}


