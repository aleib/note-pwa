import type { Id, TaskPriority } from "../domain/types";

export type ExtractedTaskDraft = {
  id: Id;
  confidence: number; // 0..1
  title: string;
  notes?: string;
  dueDate?: string; // ISO date
  priority?: TaskPriority;
  listId: Id;
  tags?: string[];
};

export type ExtractedNoteDraft = {
  id: Id;
  confidence: number; // 0..1
  title: string;
  body: string;
  folderId: Id;
  tags?: string[];
};

export type ExtractionOptions = {
  aggressive: boolean;
  defaultTaskListId: Id;
  defaultNoteFolderId: Id;
};

export type ExtractionResult = {
  tasks: ExtractedTaskDraft[];
  notes: ExtractedNoteDraft[];
};

export type ExtractionEngine = {
  extract: (text: string, options: ExtractionOptions) => ExtractionResult;
};


