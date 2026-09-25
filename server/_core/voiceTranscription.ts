/**
 * Voice transcription helper using internal Speech-to-Text service
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage (e.g., S3) to get URL
 * 3. Call transcription with the URL
 * 
 * Example usage:
 * ```tsx
 * // Frontend component
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *     console.log(data.segments); // Timestamped segments
 *   }
 * });
 * 
 * // After uploading audio to storage
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 *   prompt: 'Transcribe the meeting' // optional
 * });
 * ```
 */
import { ENV } from "./env";

export type TranscribeOptions = {
  audioUrl: string; // URL to the audio file (e.g., S3 URL)
  language?: string; // Optional: specify language code (e.g., "en", "es", "zh")
  prompt?: string; // Optional: custom prompt for the transcription
};

// Native Whisper API segment format
export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
};

// Native Whisper API response format
export type WhisperResponse = {
  task: "transcribe";
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
};

export type TranscriptionResponse = WhisperResponse; // Return native Whisper API response directly

export type TranscriptionError = {
  error: string;
  code: "FILE_TOO_LARGE" | "INVALID_FORMAT" | "TRANSCRIPTION_FAILED" | "UPLOAD_FAILED" | "SERVICE_ERROR";
  details?: string;
};

/**
 * Transcribe audio to text using the internal Speech-to-Text service
 * 
 * @param options - Audio data and metadata
 * @returns Transcription result or error
 */
export async function transcribeAudio(
  options: TranscribeOptions
): Promise<TranscriptionResponse | TranscriptionError> {
  try {
    const providerKey = ENV.elevenLabsApiKey || ENV.forgeApiKey;
    const modelId = process.env.ELEVENLABS_MODEL_ID || "scribe_v1";
    const mimeType = options.mimeType || "audio/mpeg";

    if (!providerKey) {
      return {
        error: "Voice transcription service authentication is missing",
        code: "SERVICE_ERROR",
        details: "Set ELEVENLABS_API_KEY or BUILT_IN_FORGE_API_KEY before running transcription"
      };
    }

    let audioBuffer: Buffer;
    if (options.audioBase64) {
      try {
        audioBuffer = Buffer.from(options.audioBase64, "base64");
      } catch (error) {
        return {
          error: "Invalid audio payload",
          code: "INVALID_FORMAT",
          details: error instanceof Error ? error.message : "Audio payload could not be decoded"
        };
      }
    } else if (options.audioUrl) {
      try {
        const response = await fetch(options.audioUrl);
        if (!response.ok) {
          return {
            error: "Failed to download audio file",
            code: "INVALID_FORMAT",
            details: `HTTP ${response.status}: ${response.statusText}`
          };
        }
        audioBuffer = Buffer.from(await response.arrayBuffer());
      } catch (error) {
        return {
          error: "Failed to fetch audio file",
          code: "SERVICE_ERROR",
          details: error instanceof Error ? error.message : "Unknown error"
        };
      }
    } else {
      return {
        error: "No audio source supplied",
        code: "INVALID_FORMAT",
        details: "Provide audioBase64 or audioUrl before transcription"
      };
    }

    const sizeMB = audioBuffer.length / (1024 * 1024);
    if (sizeMB > 16) {
      return {
        error: "Audio file exceeds maximum size limit",
        code: "FILE_TOO_LARGE",
        details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 16MB`
      };
    }

    const formData = new FormData();
    const filename = `audio.${getFileExtension(mimeType)}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append("file", audioBlob, filename);
    formData.append("model_id", modelId);

    const languageCode = options.language || "en";
    if (languageCode) {
      formData.append("language_code", languageCode);
    }

    const prompt = options.prompt || `Transcribe the user's voice to text using ${getLanguageName(languageCode)}.`;
    formData.append("prompt", prompt);

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": providerKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      };
    }

    const payload = await response.json() as any;
    const text = typeof payload.text === "string"
      ? payload.text
      : typeof payload.transcript === "string"
        ? payload.transcript
        : typeof payload.output === "string"
          ? payload.output
          : "";

    if (!text) {
      return {
        error: "Invalid transcription response",
        code: "SERVICE_ERROR",
        details: "The transcription provider returned no text"
      };
    }

    const segments: WhisperSegment[] = Array.isArray(payload.segments)
      ? payload.segments.map((segment: any, index: number) => ({
          id: Number(segment.id ?? index + 1),
          seek: Number(segment.seek ?? 0),
          start: Number(segment.start ?? 0),
          end: Number(segment.end ?? 0),
          text: String(segment.text ?? text),
          tokens: Array.isArray(segment.tokens) ? segment.tokens : [],
          temperature: Number(segment.temperature ?? 0),
          avg_logprob: Number(segment.avg_logprob ?? 0),
          compression_ratio: Number(segment.compression_ratio ?? 0),
          no_speech_prob: Number(segment.no_speech_prob ?? 0),
        }))
      : [];

    return {
      task: "transcribe",
      language: payload.language_code || languageCode || "en",
      duration: Number(payload.duration ?? 0),
      text,
      segments,
    };
  } catch (error) {
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

/**
 * Helper function to get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/ogg': 'ogg',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
  };
  
  return mimeToExt[mimeType] || 'audio';
}

/**
 * Helper function to get full language name from ISO code
 */
function getLanguageName(langCode: string): string {
  const langMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
  };
  
  return langMap[langCode] || langCode;
}

/**
 * Example tRPC procedure implementation:
 * 
 * ```ts
 * // In server/routers.ts
 * import { transcribeAudio } from "./_core/voiceTranscription";
 * 
 * export const voiceRouter = router({
 *   transcribe: protectedProcedure
 *     .input(z.object({
 *       audioUrl: z.string(),
 *       language: z.string().optional(),
 *       prompt: z.string().optional(),
 *     }))
 *     .mutation(async ({ input, ctx }) => {
 *       const result = await transcribeAudio(input);
 *       
 *       // Check if it's an error
 *       if ('error' in result) {
 *         throw new TRPCError({
 *           code: 'BAD_REQUEST',
 *           message: result.error,
 *           cause: result,
 *         });
 *       }
 *       
 *       // Optionally save transcription to database
 *       await db.insert(transcriptions).values({
 *         userId: ctx.user.id,
 *         text: result.text,
 *         duration: result.duration,
 *         language: result.language,
 *         audioUrl: input.audioUrl,
 *         createdAt: new Date(),
 *       });
 *       
 *       return result;
 *     }),
 * });
 * ```
 */
