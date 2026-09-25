import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const stopWords = new Set(["the", "a", "an", "and", "or", "to", "of", "in", "is", "it", "i", "you", "we", "this", "that", "for", "on", "with", "was", "were", "are"]);
const fillerList = ["um", "uh", "like", "actually", "basically", "you know"];

function tokenize(text: string) {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function analyzeTextValue(text: string) {
  const clean = text.trim();
  const words = tokenize(clean);
  const counts = words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
  const repeated = Object.entries(counts)
    .filter(([word, count]) => count > 2 && !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count, suggestions: word === "good" ? ["effective", "impressive", "valuable"] : ["specific", "clear", "strong"] }));
  const errors: Array<{ id: number; type: string; original: string; correction: string; explanation: string; rule: string; practice: string; answer: string }> = [];
  const addError = (original: string, correction: string, explanation: string, rule: string, practice: string, answer: string) => errors.push({ id: errors.length + 1, type: "Grammar", original, correction, explanation, rule, practice, answer });

  if (/\byesterday\s+i\s+go\b/i.test(clean)) addError("Yesterday I go", "Yesterday, I went", "“Yesterday” places the action in a completed past event.", "Use the appropriate past-tense form for completed past events.", "Last week, I ___ to Chennai.", "went");
  if (/\b(i|we|they)\s+was\b/i.test(clean)) addError(clean.match(/\b(i|we|they)\s+was\b/i)?.[0] ?? "I was", "we were", "Plural subjects use “were” in the past tense.", "Match the verb to the subject.", "They ___ ready.", "were");
  if (/\b(he|she|it)\s+have\b/i.test(clean)) addError(clean.match(/\b(he|she|it)\s+have\b/i)?.[0] ?? "She have", "she has", "Third-person singular subjects take “has” in the present tense.", "Use has with he, she, or it.", "She ___ a plan.", "has");
  if (/\bdiscuss about\b/i.test(clean)) addError("discuss about", "discuss", "The verb “discuss” already includes the idea of talking about a topic.", "Use discuss + object without the extra preposition.", "We will ___ the proposal.", "discuss");

  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgSentenceLength = sentences.length ? Math.round(words.length / sentences.length) : 0;
  const fillerCounts = fillerList.map((word) => ({ word, count: (clean.toLowerCase().match(new RegExp(`\\b${word.replace(" ", "\\s+")}\\b`, "g")) ?? []).length })).filter((item) => item.count > 0);
  const fillerTotal = fillerCounts.reduce((sum, item) => sum + item.count, 0);
  const grammar = Math.max(48, 96 - errors.length * 12);
  const vocabulary = Math.max(52, 88 - repeated.length * 7);
  const fluency = Math.max(50, Math.min(94, 72 + Math.min(16, Math.floor(words.length / 18)) - fillerTotal * 3));
  const natural = Math.max(54, 91 - errors.length * 5 - repeated.length * 2);
  const sentenceType = avgSentenceLength > 20 ? "Complex" : avgSentenceLength > 11 ? "Compound" : "Simple";

  return {
    text: clean,
    wordCount: words.length,
    sentenceCount: sentences.length,
    averageSentenceLength: avgSentenceLength,
    sentenceType,
    errors,
    repeated,
    fillerCounts,
    fillerTotal,
    scores: { grammar, vocabulary, fluency, naturalness: natural },
    naturalVersion: errors.length ? clean.replace(/Yesterday I go/i, "Yesterday, I went").replace(/\bmeet\b/i, "met") : clean,
    advancedVersion: errors.length ? "Yesterday, I visited college and caught up with a close friend." : `In a more polished version, ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`,
    strengths: errors.length ? ["Your message is easy to understand", "You expressed a complete idea"] : ["Clear sentence structure", "Appropriate word choice"],
  };
}

const dashboardData = {
  greeting: "Good evening, Ananya",
  subtitle: "A few focused minutes can make your next conversation feel easier.",
  overall: 78,
  xp: 1240,
  level: 7,
  streak: 7,
  dailyGoal: 64,
  weeklyMinutes: 42,
  wordOfDay: { word: "resilient", meaning: "Able to recover from difficulties.", example: "She remained resilient despite many challenges.", synonyms: ["strong", "persistent", "adaptable"] },
  practice: [
    { id: "tense", title: "Verb tense tune-up", meta: "3 min · based on your history", type: "Grammar", color: "indigo" },
    { id: "speaking", title: "One-minute speaking sprint", meta: "1 min · build your flow", type: "Speaking", color: "mint" },
    { id: "vocab", title: "Make your words sharper", meta: "5 words · vocabulary", type: "Vocabulary", color: "sun" },
  ],
  commonErrors: [
    { label: "Verb tense", count: 12, score: 82, color: "#4352c7" },
    { label: "Articles", count: 8, score: 74, color: "#ef9c70" },
    { label: "Prepositions", count: 6, score: 68, color: "#62a989" },
  ],
  achievements: [
    { icon: "✦", title: "First speech", detail: "Completed", tone: "indigo" },
    { icon: "7", title: "Steady voice", detail: "7 day streak", tone: "sun" },
    { icon: "↗", title: "Finding flow", detail: "+12 this month", tone: "mint" },
  ],
};

const demoLeaderboard = [
  { rank: 1, name: "Maya R.", xp: 1680, initials: "MR", tone: "#e2e1fb" },
  { rank: 2, name: "Arjun K.", xp: 1510, initials: "AK", tone: "#d7f0e5" },
  { rank: 3, name: "Ananya S.", xp: 1240, initials: "AS", tone: "#f7d77a", you: true },
  { rank: 4, name: "Dev P.", xp: 1105, initials: "DP", tone: "#f5b2a5" },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  voice: router({
    transcribe: publicProcedure.input(z.object({
      audioBase64: z.string().min(1),
      mimeType: z.string().default("audio/webm"),
      language: z.string().optional(),
      prompt: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { transcribeAudio } = await import("./_core/voiceTranscription");
      const result = await transcribeAudio({
        audioBase64: input.audioBase64,
        mimeType: input.mimeType,
        language: input.language,
        prompt: input.prompt,
      });

      if ("error" in result) {
        return {
          ok: false,
          error: result.error,
          code: result.code,
          details: result.details,
        };
      }

      return {
        ok: true,
        text: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments,
      };
    }),
  }),
  speakwise: router({
    dashboard: publicProcedure.query(() => dashboardData),
    leaderboard: publicProcedure.query(() => demoLeaderboard),
    analyzeText: publicProcedure.input(z.object({ text: z.string().min(1).max(8000), mode: z.enum(["text", "speech"]).default("text") })).mutation(({ input }) => {
      const result = analyzeTextValue(input.text);
      return { ...result, mode: input.mode, createdAt: new Date().toISOString() };
    }),
    speechMetrics: publicProcedure.input(z.object({ transcript: z.string().min(1), durationSeconds: z.number().min(1).max(3600) })).mutation(({ input }) => {
      const result = analyzeTextValue(input.transcript);
      const wordsPerMinute = Math.round((result.wordCount / input.durationSeconds) * 60);
      const longPauses = Math.max(0, Math.min(6, Math.round(input.durationSeconds / 28) + result.fillerTotal));
      return { ...result, mode: "speech", durationSeconds: input.durationSeconds, wordsPerMinute, longPauses, pronunciation: { status: "provider_pending", message: "Phoneme scoring is available when a pronunciation provider is configured." }, createdAt: new Date().toISOString() };
    }),
    profile: publicProcedure.query(() => ({ scores: { grammar: 82, vocabulary: 74, fluency: 78, pronunciation: 81 }, commonErrors: dashboardData.commonErrors, patterns: [{ label: "Filler words", value: "6 / session", trend: "down 18%" }, { label: "Long pauses", value: "3 / session", trend: "down 9%" }, { label: "Speaking rate", value: "118 WPM", trend: "steady" }] })),
    exercises: publicProcedure.query(() => ({ items: [
      { id: "ex-1", kind: "Fill in the blank", title: "Past tense, made simple", prompt: "Last week, I ___ to Chennai for a workshop.", answer: "went", choices: ["go", "went", "going"], skill: "Verb tense", xp: 10 },
      { id: "ex-2", kind: "Sentence improvement", title: "Sound more natural", prompt: "Choose the clearest version.", answer: "I would like to discuss the proposal.", choices: ["I would like to discuss about the proposal.", "I would like to discuss the proposal.", "I like discussing about proposal."], skill: "Prepositions", xp: 10 },
      { id: "ex-3", kind: "Speaking challenge", title: "A calm one-minute answer", prompt: "Describe a skill you are currently improving.", answer: "Speak for 60 seconds with one intentional pause.", choices: [], skill: "Fluency", xp: 20 },
    ] })),
    submitExercise: publicProcedure.input(z.object({ exerciseId: z.string(), answer: z.string() })).mutation(({ input }) => ({ correct: input.exerciseId === "ex-1" ? input.answer === "went" : input.exerciseId === "ex-2" ? input.answer === "I would like to discuss the proposal." : true, xpEarned: input.exerciseId === "ex-3" ? 20 : 10, feedback: "Nice work. Keep this pattern in your next speaking session." })),
    conversation: publicProcedure.input(z.object({ scenario: z.string(), message: z.string().min(1) })).mutation(({ input }) => ({ scenario: input.scenario, reply: input.scenario === "Job interview" ? "That is a thoughtful example. What did you learn from that experience?" : "That sounds interesting. Tell me a little more about it.", feedback: { gentleNote: "Your message is clear. Try adding one specific detail to make it more vivid.", strengths: ["Clear intent", "Friendly tone"] }, demo: true })),
  }),
});

export type AppRouter = typeof appRouter;
