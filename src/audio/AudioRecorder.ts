export type RecordingResult = {
  blob: Blob;
  durationMs: number;
};

type RecorderState = "idle" | "recording" | "stopped";

/**
 * Intent: provide a tiny MediaRecorder wrapper that is safe to use in UI code.
 * - only records audio in-memory
 * - cleans up microphone tracks on stop
 */
export class AudioRecorder {
  #state: RecorderState = "idle";
  #stream: MediaStream | null = null;
  #recorder: MediaRecorder | null = null;
  #chunks: BlobPart[] = [];
  #startedAtMs: number | null = null;

  get state() {
    return this.#state;
  }

  async start(): Promise<void> {
    if (this.#state === "recording") return;

    this.#chunks = [];
    this.#startedAtMs = Date.now();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (e) => {
      if (e.data && e.data.size > 0) this.#chunks.push(e.data);
    });

    recorder.start();

    this.#stream = stream;
    this.#recorder = recorder;
    this.#state = "recording";
  }

  async stop(): Promise<RecordingResult> {
    if (this.#state !== "recording" || !this.#recorder) {
      throw new Error("Recorder is not active");
    }

    const recorder = this.#recorder;
    const startedAtMs = this.#startedAtMs ?? Date.now();

    const done = new Promise<RecordingResult>((resolve, reject) => {
      recorder.addEventListener("stop", () => {
        try {
          const blob = new Blob(this.#chunks, { type: recorder.mimeType || "audio/webm" });
          resolve({ blob, durationMs: Math.max(0, Date.now() - startedAtMs) });
        } catch (err) {
          reject(err);
        }
      });
      recorder.addEventListener("error", () => reject(new Error("MediaRecorder error")));
    });

    recorder.stop();
    this.#state = "stopped";

    // Ensure the mic is released promptly (critical for iOS Safari UX).
    this.#stream?.getTracks().forEach((t) => t.stop());
    this.#stream = null;
    this.#recorder = null;

    return done;
  }
}


