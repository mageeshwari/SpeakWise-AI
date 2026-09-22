import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("SpeakWise analysis", () => {
  it("detects a past-tense error and returns natural alternatives", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.speakwise.analyzeText({
      text: "Yesterday I go to college and meet my friend.",
      mode: "text",
    });

    expect(result.errors[0]?.type).toBe("Grammar");
    expect(result.errors[0]?.correction).toContain("went");
    expect(result.naturalVersion).toContain("went");
    expect(result.scores.grammar).toBeLessThan(100);
  });

  it("returns deterministic speech metrics and gates pronunciation scoring", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.speakwise.speechMetrics({
      transcript: "Um, I actually like this idea.",
      durationSeconds: 30,
    });

    expect(result.wordsPerMinute).toBeGreaterThan(0);
    expect(result.fillerTotal).toBe(3);
    expect(result.pronunciation.status).toBe("provider_pending");
    expect(result.pronunciation.message).toContain("provider");
  });

  it("returns personalized exercise feedback", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.speakwise.submitExercise({ exerciseId: "ex-1", answer: "went" });

    expect(result.correct).toBe(true);
    expect(result.xpEarned).toBe(10);
  });

  it("keeps the conversation adapter scenario-aware", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.speakwise.conversation({ scenario: "Job interview", message: "I led a student project." });

    expect(result.demo).toBe(true);
    expect(result.reply).toContain("experience");
    expect(result.feedback.strengths.length).toBeGreaterThan(0);
  });
});
