export type Id = string;

export type BaseFields = {
  id: Id;
  createdAt: number;
  updatedAt: number;
  sourceTranscriptId: Id;
  tags?: string[];
};

export type Transcript = {
  id: Id;
  text: string;
  createdAt: number;
};

export type TaskPriority = "low" | "medium" | "high";

export type Task = BaseFields & {
  title: string;
  notes?: string;
  dueDate?: string; // ISO date (YYYY-MM-DD) for Phase 1 simplicity
  priority?: TaskPriority;
  completed: boolean;
  listId: Id;
  linkedNoteIds?: Id[];
  parentTaskId?: Id;
};

export type TaskList = {
  id: Id;
  name: string;
};

export type Note = BaseFields & {
  title: string;
  body: string;
  folderId: Id;
  linkedTaskIds?: Id[];
};

export type NoteFolder = {
  id: Id;
  name: string;
};


