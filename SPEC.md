Below is a **reworked, implementation-ready technical specification** adapted from your original spec, but **explicitly designed as a web app (PWA)** instead of React Native.

I have made firm decisions where the web platform forces trade-offs, always biasing toward:

- zero cost
- fastest path to working MVP
- browser compatibility on iPhone (Safari)
- simplicity over cleverness

This is **Phase 1 only**.

---

# Technical Specification

## Personal Voice-First Tasks & Notes Web App (PWA)

---

## 1. Purpose & Core Concept

Build a **personal, offline-capable web app** that runs in the browser (Safari on iPhone) and can be **installed to the home screen as a PWA**.

The app allows the user to:

1. Record short voice notes
2. Transcribe speech to text in the browser
3. Automatically extract and categorize:

   - **Tasks** (things to do)
   - **Notes** (informational content)

4. Organize tasks into lists and notes into folders
5. Review and confirm extracted items before saving
6. Persist transcriptions, tasks, and notes locally
7. Search tasks and notes via full-text search

The app is **single-user, private, offline-first**, and has **no backend**.

---

## 2. Scope & Constraints (Phase 1 Only)

### In scope

- Web app (React + TypeScript)
- Mobile-first UI (iPhone Safari)
- Installable PWA
- Browser speech-to-text
- Local persistence
- Rule-based NLP extraction
- Manual review & confirmation

### Explicitly out of scope

- Native iOS APIs
- Apple Reminders / Notes sync
- iCloud
- Accounts / auth
- Notifications
- Payments
- Backend / server
- App Store publishing

---

## 3. Platform & Stack

### Frontend

- **React**
- **TypeScript**
- Vite or similar lightweight bundler
- Mobile-first responsive design

### PWA

- Web App Manifest
- Service Worker for offline support
- Add-to-Home-Screen support on iOS

### Runtime Environment

- Safari (iOS)
- Chrome / Desktop optional but not a priority

---

## 4. Audio Recording & Transcription (Web-Appropriate)

### Recording

- Use **MediaRecorder API**
- Short recordings (10s–60s typical)
- Recording stops explicitly by user
- No background recording
- Audio blobs exist only in memory

### Transcription

- Use **Web Speech API** (`SpeechRecognition`)

  - On iOS Safari this delegates to Apple’s speech engine

- Transcribe **after recording completes**
- English only
- Automatic punctuation and segmentation (best-effort)
- No timestamps or confidence scores

> Important trade-off:
>
> - Web Speech API is the **only free, zero-setup option**
> - Accuracy is acceptable but not perfect
> - Architecture must allow swapping in a better engine later

### Storage

- **Do not persist audio**
- Persist **transcription text only**

---

## 5. Data Model (Web-Friendly, Apple-Compatible)

The internal shape mirrors Apple Reminders and Apple Notes to keep future sync feasible.

### Shared Base Fields

```ts
id: string // UUID
createdAt: number
updatedAt: number
sourceTranscriptId: string
tags?: string[]
```

---

### Transcript

```ts
Transcript {
  id
  text: string
  createdAt
}
```

---

### Task

```ts
Task {
  id
  title: string
  notes?: string
  dueDate?: string // ISO date
  priority?: "low" | "medium" | "high"
  completed: boolean
  listId: string
  tags?: string[]
  linkedNoteIds?: string[]
  parentTaskId?: string
}
```

- Subtasks supported
- Checklists supported
- Duplicate tasks allowed

---

### Task List

```ts
TaskList {
  id
  name: string
}
```

---

### Note

```ts
Note {
  id
  title: string
  body: string
  folderId: string
  tags?: string[]
  linkedTaskIds?: string[]
}
```

- Plain text only
- No attachments
- No rich text
- No version history

---

### Note Folder

```ts
NoteFolder {
  id
  name: string
}
```

---

## 6. Local Persistence & Search

### Storage

- **IndexedDB**

  - Via a thin wrapper (Dexie or hand-rolled)

- All data stored locally in the browser
- No encryption required
- Data persists across sessions and offline

### Search

- Full-text search across:

  - Task titles
  - Task notes
  - Note titles
  - Note bodies

- Simple fuzzy matching
- No semantic / vector search
- Performance does not need to be instant

---

## 7. Classification & Extraction (Phase 1 NLP)

### Strategy

- **Pure rules + heuristics**
- No cloud calls
- No paid APIs
- Engine must be replaceable later

### Flow

1. Take full transcription text
2. Split into sentences / clauses
3. For each segment:

   - Determine intent:

     - Task vs Note

   - Extract:

     - Task title
     - Due date / time (basic natural language parsing)
     - Tags (keyword-based)

4. Group results
5. Assign default list / folder
6. Send to review screen

### Aggressiveness

- Configurable:

  - **Aggressive (default)**: auto-extract multiple items
  - Conservative fallback: present suggestions only

### Ambiguity Handling

- Low-confidence items shown as editable suggestions
- User confirms everything before save

---

## 8. Review & Confirmation UX (Critical)

### Review Screen (Mandatory)

After transcription:

- Show:

  - Full transcript (read-only)
  - Extracted tasks
  - Extracted notes

- Allow:

  - Edit titles
  - Edit due dates
  - Move between lists / folders
  - Delete extracted items

- Single **“Confirm All”** button persists everything

No background auto-saving.

---

## 9. UI Structure (Web-Optimized)

### Pages / Views

1. **Home**

   - Central “Record” button
   - Navigation to Tasks / Notes / Search

2. **Recording**

   - Minimal recording UI

3. **Review**

   - Transcript + extracted items

4. **Tasks**

   - List view grouped by task list

5. **Notes**

   - Folder list → notes list

6. **Search**

   - Unified search results

### Design Principles

- Minimal
- Compact
- Mobile-first
- Looks native when installed as PWA
- No heavy animations

---

## 10. Settings

- Toggle:

  - Aggressive vs conservative extraction

- Actions:

  - Delete all transcripts
  - Delete all local data

- No accounts
- No authentication
- No sync settings (Phase 1)

---

## 11. Offline Behavior (PWA)

- App loads offline
- Existing data accessible offline
- Recording & transcription require network availability

  - If unavailable, show clear error

- No background sync

---

## 12. Error Handling & Edge Cases

- Duplicate tasks allowed
- English only
- If speech recognition fails:

  - Show error
  - Allow retry

- If microphone permission denied:

  - Block recording
  - Show clear instructions

- No crash analytics

---

## 13. Architecture Guidelines

### Core Modules

- `AudioRecorder`
- `SpeechTranscriber`
- `ExtractionEngine`
- `StorageLayer`
- `SearchIndex`

### Key Requirement

- Extraction engine must be **swappable** (rules → LLM later)

### Testing

- No automated tests required
- Manual verification sufficient

---

## 14. Acceptance Criteria (Phase 1)

- Works reliably in iPhone Safari
- Can be installed as PWA
- Speech-to-text works for short recordings
- Multiple tasks and notes extracted from one recording
- Review screen allows correction
- Data persists locally
- Search works
- No backend or paid services

---

## 15. Explicit Non-Goals

- No native iOS features
- No reminders firing
- No calendar UI
- No sync
- No notifications
- No semantic AI
- No App Store

---

If you want, the **next best step** is one of:

1. A **concrete folder/file structure** for the app
2. A **step-by-step build plan** for an AI coding agent
3. A **detailed NLP ruleset** for task vs note extraction

Say which one and I’ll produce it.
