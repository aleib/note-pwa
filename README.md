## note-pwa

**Personal, offline-first voice tasks & notes web app (PWA)** built with **React** and **TypeScript**, designed primarily for **iPhone Safari** and installable to the home screen.

This repo implements the **Phase 1** version described in `SPEC.md`.

---

## What it does

- **Record short voice notes** in the browser
- **Transcribe speech to text** using the Web Speech API
- **Extract tasks and notes** from the transcript via a simple rules-based engine
- **Review and confirm** extracted items before saving
- **Organize**:
  - Tasks into **lists**
  - Notes into **folders**
- **Store everything locally** (IndexedDB) with **full-text search**
- **Work offline** for viewing and managing existing data  
  (recording/transcription may require network on some devices)

There is **no backend**, no accounts, and no sync; data stays on the device.

---

## High-level architecture

- **PWA shell**: React + TypeScript SPA with manifest and service worker
- **Audio & speech**: `MediaRecorder` + Web Speech API (`SpeechRecognition`)
- **Extraction**: pluggable, rules-based engine that classifies transcript segments as **Task** or **Note**
- **Storage**: IndexedDB-backed layer for transcripts, tasks, notes, lists, and folders
- **Search**: simple full-text search over tasks and notes

The extraction and transcription layers are designed to be **swappable** in future phases.

---

## Main views

- **Home** – central “Record” button and navigation to Tasks, Notes, Search
- **Recording** – minimal capture UI
- **Review** – transcript + extracted tasks/notes, with edit and confirm
- **Tasks** – task lists and items
- **Notes** – folders and notes
- **Search** – unified search over tasks and notes

---

## More detail

For full technical details, constraints, and acceptance criteria, see **`SPEC.md`**.
