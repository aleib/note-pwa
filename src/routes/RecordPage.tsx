import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AudioRecorder, type RecordingResult } from "../audio/AudioRecorder";
import { rulesEngine } from "../extraction/rulesEngine";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { SpeechTranscriber } from "../speech/SpeechTranscriber";
import { useReviewStore } from "../state/reviewStore";
import { useSettingsStore } from "../state/settingsStore";
import { ensureDefaults } from "../storage/repo";

type UiState = "idle" | "recording" | "processing" | "recorded" | "error";

function formatSeconds(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${seconds}s`;
}

export function RecordPage() {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const aggressiveExtraction = useSettingsStore((s) => s.aggressiveExtraction);
  const startSession = useReviewStore((s) => s.startSession);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const transcriberRef = useRef<SpeechTranscriber | null>(null);
  const [uiState, setUiState] = useState<UiState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const [transcriptText, setTranscriptText] = useState("");

  const isMediaRecorderSupported = useMemo(() => {
    return typeof window !== "undefined" && "MediaRecorder" in window;
  }, []);

  const isSpeechRecognitionSupported = useMemo(() => {
    return new SpeechTranscriber().isSupported;
  }, []);

  useEffect(() => {
    if (uiState !== "recording") return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => window.clearInterval(timer);
  }, [uiState]);

  useEffect(() => {
    return () => {
      // Clean up any in-memory blob URLs later (we create them in render).
      // (Nothing to do here yet.)
    };
  }, []);

  async function onStart() {
    if (!isOnline) {
      setError("You are offline. Speech recognition may require network access on this device.");
      setUiState("error");
      return;
    }
    if (!isMediaRecorderSupported) {
      setError("MediaRecorder is not supported in this browser.");
      setUiState("error");
      return;
    }
    if (!isSpeechRecognitionSupported) {
      setError("Speech recognition is not supported in this browser.");
      setUiState("error");
      return;
    }

    setError(null);
    setRecording(null);
    setTranscriptText("");
    setElapsedMs(0);

    const recorder = new AudioRecorder();
    const transcriber = new SpeechTranscriber();
    recorderRef.current = recorder;
    transcriberRef.current = transcriber;

    try {
      transcriber.start({
        onText: (text) => setTranscriptText(text),
        onError: (message) => {
          setError(message);
          setUiState("error");
          // Best-effort cleanup: if speech fails, stop recording to release the mic.
          const activeRecorder = recorderRef.current;
          if (activeRecorder) {
            void activeRecorder.stop().catch(() => {});
            recorderRef.current = null;
          }
          transcriberRef.current = null;
        }
      });
      await recorder.start();
      setUiState("recording");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start recording");
      setUiState("error");
    }
  }

  async function onStop() {
    const recorder = recorderRef.current;
    const transcriber = transcriberRef.current;
    if (!recorder || !transcriber) return;

    setUiState("processing");
    try {
      const [audioSettled, transcriptSettled] = await Promise.allSettled([recorder.stop(), transcriber.stop()]);

      if (audioSettled.status === "fulfilled") {
        setRecording(audioSettled.value);
      } else {
        throw audioSettled.reason;
      }

      if (transcriptSettled.status === "fulfilled") {
        const text = transcriptSettled.value.text.trim();
        setTranscriptText(text);

        if (text) {
          const { defaultTaskListId, defaultNoteFolderId } = await ensureDefaults();
          const extracted = rulesEngine.extract(text, {
            aggressive: aggressiveExtraction,
            defaultTaskListId,
            defaultNoteFolderId
          });
          startSession({ transcriptText: text, createdAt: Date.now(), tasks: extracted.tasks, notes: extracted.notes });
          navigate("/review");
          return;
        }
      } else {
        setTranscriptText("");
        setError(transcriptSettled.reason instanceof Error ? transcriptSettled.reason.message : "Transcription failed");
      }

      setUiState("recorded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop recording");
      setUiState("error");
    } finally {
      recorderRef.current = null;
      transcriberRef.current = null;
    }
  }

  const audioUrl = useMemo(() => {
    if (!recording) return null;
    return URL.createObjectURL(recording.blob);
  }, [recording]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Record</h1>
        <p className="text-sm text-slate-300">
          Audio stays in memory only. You’ll review text before saving.
        </p>
      </header>

      {!isOnline ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          You’re offline. You can still browse Tasks/Notes, but recording/transcription may not work.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Session</div>
          <div className="text-xs text-slate-400">
            {uiState === "recording" ? `Recording · ${formatSeconds(elapsedMs)}` : "Ready"}
          </div>
        </div>

        <div className="mt-4">
          {uiState === "recording" ? (
            <button
              type="button"
              onClick={() => void onStop()}
              className="w-full rounded-2xl bg-rose-500 px-4 py-4 text-base font-semibold text-slate-950"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onStart()}
              disabled={!isOnline || !isMediaRecorderSupported || !isSpeechRecognitionSupported || uiState === "processing"}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-base font-semibold text-slate-950 disabled:opacity-50"
            >
              {uiState === "processing" ? "Processing…" : "Start"}
            </button>
          )}
        </div>

        {uiState === "recording" && transcriptText ? (
          <div className="mt-4 rounded-2xl border border-slate-800 p-3 text-sm text-slate-200">
            {transcriptText}
          </div>
        ) : null}

        {uiState === "recorded" && recording && audioUrl ? (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-slate-300">Recorded: {formatSeconds(recording.durationMs)}</div>
            <audio controls src={audioUrl} className="w-full" />
            {transcriptText ? (
              <div className="rounded-2xl border border-slate-800 p-3 text-sm text-slate-200">{transcriptText}</div>
            ) : (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                No transcript captured.
              </div>
            )}
            <div className="text-xs text-slate-500">
              Next step: transcription + extraction + review (coming next).
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}


