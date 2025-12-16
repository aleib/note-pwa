export type TranscriberResult = {
  text: string;
};

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported"
  | string;

type SpeechRecognitionErrorEventLike = {
  error: SpeechRecognitionErrorCode;
  message?: string;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
  confidence?: number;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  item: (idx: number) => SpeechRecognitionAlternativeLike;
  [idx: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  item: (idx: number) => SpeechRecognitionResultLike;
  [idx: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function describeSpeechError(code: SpeechRecognitionErrorCode) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was denied.";
    case "audio-capture":
      return "No microphone was found or it could not be accessed.";
    case "network":
      return "Speech recognition requires network access on this device.";
    case "no-speech":
      return "No speech was detected. Try again.";
    default:
      return `Speech recognition error: ${code}`;
  }
}

/**
 * Thin wrapper around the Web Speech API.
 *
 * Intent: keep this module swappable (engine changes shouldn't ripple into UI).
 * We expose a start/stop lifecycle so the UI can align it with a recording session.
 */
export class SpeechTranscriber {
  #recognition: SpeechRecognitionLike | null = null;
  #isRunning = false;
  #lastText = "";
  #lastError: string | null = null;

  get isSupported() {
    return getSpeechRecognitionCtor() !== null;
  }

  get isRunning() {
    return this.#isRunning;
  }

  start(options?: { lang?: string; onText?: (text: string) => void; onError?: (message: string) => void }): void {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) throw new Error("SpeechRecognition is not supported in this browser.");
    if (this.#isRunning) return;

    const recognition = new Ctor();
    recognition.lang = options?.lang ?? "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    this.#lastText = "";
    this.#lastError = null;

    recognition.onresult = (e) => {
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i += 1) {
        const result = e.results.item(i);
        const alt = result.item(0);
        const transcript = alt?.transcript?.trim();
        if (transcript) parts.push(transcript);
      }
      this.#lastText = parts.join(" ").trim();
      options?.onText?.(this.#lastText);
    };

    recognition.onerror = (e) => {
      const message = describeSpeechError(e.error);
      this.#lastError = message;
      this.#isRunning = false;
      options?.onError?.(message);
      // We abort on any error to avoid leaving the engine in a weird state.
      recognition.abort();
    };

    recognition.start();
    this.#recognition = recognition;
    this.#isRunning = true;
  }

  stop(): Promise<TranscriberResult> {
    const recognition = this.#recognition;
    if (!recognition || !this.#isRunning) {
      return this.#lastError ? Promise.reject(new Error(this.#lastError)) : Promise.resolve({ text: this.#lastText });
    }

    return new Promise<TranscriberResult>((resolve, reject) => {
      recognition.onend = () => {
        this.#isRunning = false;
        this.#recognition = null;
        if (this.#lastError) reject(new Error(this.#lastError));
        else resolve({ text: this.#lastText });
      };
      recognition.onerror = (e) => {
        this.#lastError = describeSpeechError(e.error);
        this.#isRunning = false;
        this.#recognition = null;
        reject(new Error(this.#lastError));
      };

      try {
        recognition.stop();
      } catch (err) {
        reject(err);
      }
    });
  }
}


