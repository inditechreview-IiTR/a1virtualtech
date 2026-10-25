import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { scoreAttempt, summarize, type AttemptRecord } from "./progress.ts";

const baseInput = {
  firstTryCorrect: 3,
  totalSteps: 3,
  wrongAnswers: 0,
  toolsUsed: ["interview", "testdrive", "inspect", "scan", "meter"],
  seconds: 300,
  estimatedMinutes: 10,
};

const attempt = (category: AttemptRecord["category"], score: number, overrides: Partial<AttemptRecord> = {}): AttemptRecord => ({
  scenarioId: `${category}-${score}-${Math.random()}`,
  category,
  difficulty: "Beginner",
  completedAt: 1,
  firstTryCorrect: 2,
  totalSteps: 3,
  wrongAnswers: 1,
  toolsUsed: ["inspect"],
  seconds: 300,
  estimatedMinutes: 10,
  score,
  ...overrides,
});

describe("diagnostic rating accuracy", () => {
  test("full evidence and correct answers score higher than guessing with no tools", () => {
    const prepared = scoreAttempt(baseInput);
    const guessed = scoreAttempt({ ...baseInput, firstTryCorrect: 0, wrongAnswers: 4, toolsUsed: [] });
    assert.ok(prepared.total > guessed.total);
    assert.equal(prepared.total, 100);
    assert.ok(Math.abs(prepared.breakdown.reduce((sum, row) => sum + row.weight, 0) - 1) < 1e-9);
  });

  test("category scores use the true arithmetic mean for three or more attempts", () => {
    const summary = summarize([
      attempt("A1", 100),
      attempt("A1", 0),
      attempt("A1", 0),
    ]);
    assert.equal(summary.byCategory["A1"], 33);
    assert.equal(summary.overall, 33);
  });

  test("efficiency is zero with no time budget and decreases when over budget", () => {
    const noBudget = scoreAttempt({ ...baseInput, estimatedMinutes: 0 });
    const overBudget = scoreAttempt({ ...baseInput, seconds: 1200, estimatedMinutes: 10 });
    const onBudget = scoreAttempt({ ...baseInput, seconds: 600, estimatedMinutes: 10 });
    assert.equal(noBudget.breakdown.find((row) => row.label === "Efficiency")?.value, 0);
    assert.equal(overBudget.breakdown.find((row) => row.label === "Efficiency")?.value, 50);
    assert.equal(onBudget.breakdown.find((row) => row.label === "Efficiency")?.value, 100);
  });

  test("applicable tools exclude stages not offered in the scenario", () => {
    const result = scoreAttempt({
      ...baseInput,
      toolsUsed: ["interview", "testdrive", "inspect"],
      applicableTools: ["interview", "testdrive", "inspect"],
    });
    assert.equal(result.breakdown.find((row) => row.label === "Testing procedure")?.value, 100);
  });

  test("scenario-specific tools count toward procedure when actually used", () => {
    const result = scoreAttempt({
      ...baseInput,
      toolsUsed: ["interview", "testdrive", "inspect", "tool:pressure-gauge"],
      applicableTools: ["interview", "testdrive", "inspect", "tool:pressure-gauge"],
    });
    assert.equal(result.breakdown.find((row) => row.label === "Testing procedure")?.value, 100);
  });

  test("invalid and out-of-range inputs cannot create NaN or scores above 100", () => {
    const invalid = scoreAttempt({
      ...baseInput,
      firstTryCorrect: Number.POSITIVE_INFINITY,
      totalSteps: -3,
      seconds: Number.NaN,
      estimatedMinutes: Number.NaN,
      wrongAnswers: -9,
    });
    assert.ok(Number.isFinite(invalid.total));
    assert.ok(invalid.total >= 0 && invalid.total <= 100);
    assert.ok(invalid.breakdown.every((row) => row.value >= 0 && row.value <= 100));
  });

  test("overall accuracy is weighted by answered questions, not by session averages", () => {
    const summary = summarize([
      attempt("A1", 70, { firstTryCorrect: 1, totalSteps: 1 }),
      attempt("A2", 70, { firstTryCorrect: 0, totalSteps: 9 }),
    ]);
    assert.equal(summary.accuracy, 10);
  });
});
