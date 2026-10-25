import { useCallback, useEffect, useState } from "react";
import type { AseCategory, Difficulty } from "./sim/types";

export interface AttemptRecord {
  scenarioId: string;
  category: AseCategory;
  difficulty: Difficulty;
  completedAt: number;
  firstTryCorrect: number;
  totalSteps: number;
  wrongAnswers: number;
  toolsUsed: string[];
  seconds: number;
  estimatedMinutes?: number;
  score: number;
}

export interface ProfileData {
  goal: string | null;
  experience: string | null;
  name: string;
  attempts: AttemptRecord[];
}

const KEY = "ase-virtual-profile-v1";

const EMPTY: ProfileData = { goal: null, experience: null, name: "Technician", attempts: [] };

function read(): ProfileData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as ProfileData) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const SCORE_WEIGHTS = {
  diagnosticAccuracy: 0.3,
  testingProcedure: 0.2,
  evidenceInterpretation: 0.2,
  inspectionDiscipline: 0.1,
  decisionConsistency: 0.1,
  efficiency: 0.1,
};

export function scoreAttempt(input: {
  firstTryCorrect: number;
  totalSteps: number;
  wrongAnswers: number;
  toolsUsed: string[];
  seconds: number;
  estimatedMinutes: number;
  applicableTools?: string[];
}) {
  // Clamp persisted/UI-derived values so malformed data cannot create scores
  // below 0, above 100, or NaN/Infinity.
  const totalSteps = Number.isFinite(input.totalSteps) ? Math.max(0, Math.floor(input.totalSteps)) : 0;
  const firstTryCorrect = Number.isFinite(input.firstTryCorrect)
    ? Math.min(totalSteps, Math.max(0, Math.floor(input.firstTryCorrect)))
    : 0;
  const wrongAnswers = Number.isFinite(input.wrongAnswers)
    ? Math.max(0, Math.floor(input.wrongAnswers))
    : 0;
  const seconds = Number.isFinite(input.seconds) ? Math.max(0, input.seconds) : 0;
  const estimatedMinutes = Number.isFinite(input.estimatedMinutes)
    ? Math.max(0, input.estimatedMinutes)
    : 0;

  const accuracy = totalSteps > 0 ? firstTryCorrect / totalSteps : 0;
  const expectedTools = input.applicableTools ?? ["interview", "testdrive", "inspect", "scan", "meter"];
  const uniqueExpectedTools = [...new Set(expectedTools)];
  const procedure = uniqueExpectedTools.length
    ? uniqueExpectedTools.filter((tool) => input.toolsUsed.includes(tool)).length / uniqueExpectedTools.length
    : 0;
  const evidence = Math.max(0, Math.min(1, accuracy * 0.6 + procedure * 0.4));
  // This is explicitly an inspection-discipline proxy, not a safety assessment.
  // Actual safety scoring requires explicit safety decisions/actions in scenarios.
  const inspectionDiscipline = input.toolsUsed.includes("inspect") ? 1 : 0.6;
  const decisionConsistency = wrongAnswers === 0 ? 1 : Math.max(0.4, 1 - wrongAnswers * 0.2);
  const budgetSeconds = estimatedMinutes * 60;
  const efficiency = budgetSeconds > 0
    ? Math.max(0, Math.min(1, budgetSeconds / Math.max(1, seconds)))
    : 0;

  const w = SCORE_WEIGHTS;
  const total =
    accuracy * w.diagnosticAccuracy +
    procedure * w.testingProcedure +
    evidence * w.evidenceInterpretation +
    inspectionDiscipline * w.inspectionDiscipline +
    decisionConsistency * w.decisionConsistency +
    efficiency * w.efficiency;

  return {
    total: Math.max(0, Math.min(100, Math.round(total * 100))),
    breakdown: [
      { label: "Diagnostic accuracy", value: Math.round(accuracy * 100), weight: w.diagnosticAccuracy },
      { label: "Testing procedure", value: Math.round(procedure * 100), weight: w.testingProcedure },
      { label: "Evidence interpretation", value: Math.round(evidence * 100), weight: w.evidenceInterpretation },
      { label: "Inspection discipline", value: Math.round(inspectionDiscipline * 100), weight: w.inspectionDiscipline },
      { label: "Decision consistency", value: Math.round(decisionConsistency * 100), weight: w.decisionConsistency },
      { label: "Efficiency", value: Math.round(efficiency * 100), weight: w.efficiency },
    ],
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(read());
    setLoaded(true);
  }, []);

  const save = useCallback((next: ProfileData) => {
    setProfile(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setOnboarding = useCallback(
    (goal: string, experience: string) => save({ ...read(), goal, experience }),
    [save],
  );

  const addAttempt = useCallback(
    (attempt: AttemptRecord) => {
      const current = read();
      save({ ...current, attempts: [attempt, ...current.attempts].slice(0, 60) });
    },
    [save],
  );

  const reset = useCallback(() => save(EMPTY), [save]);

  return { profile, loaded, setOnboarding, addAttempt, reset };
}

export function summarize(attempts: AttemptRecord[]) {
  if (!attempts.length) {
    return {
      overall: 0,
      accuracy: 0,
      firstTime: 0,
      efficiency: 0,
      inspection: 0,
      byCategory: {} as Record<string, number>,
    };
  }

  const validAttempts = attempts.filter((attempt) =>
    Number.isFinite(attempt.score) && Number.isFinite(attempt.totalSteps) && attempt.totalSteps >= 0,
  );
  if (!validAttempts.length) {
    return {
      overall: 0,
      accuracy: 0,
      firstTime: 0,
      efficiency: 0,
      inspection: 0,
      byCategory: {} as Record<string, number>,
    };
  }

  const avg = (fn: (attempt: AttemptRecord) => number) =>
    Math.round(validAttempts.reduce((sum, attempt) => sum + fn(attempt), 0) / validAttempts.length);
  const clampPct = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  // Arithmetic mean across all attempts; do not recursively average the previous
  // aggregate, which biased categories with three or more attempts.
  const byCategory: Record<string, number> = {};
  const categoryGroups = new Map<string, AttemptRecord[]>();
  for (const attempt of validAttempts) {
    const group = categoryGroups.get(attempt.category) ?? [];
    group.push(attempt);
    categoryGroups.set(attempt.category, group);
  }
  for (const [category, group] of categoryGroups) {
    byCategory[category] = Math.round(group.reduce((sum, attempt) => sum + clampPct(attempt.score), 0) / group.length);
  }

  const answeredSteps = validAttempts.reduce((sum, attempt) => sum + Math.max(0, attempt.totalSteps), 0);
  const firstTryCorrect = validAttempts.reduce((sum, attempt) =>
    sum + Math.min(Math.max(0, attempt.totalSteps), Math.max(0, Number.isFinite(attempt.firstTryCorrect) ? attempt.firstTryCorrect : 0)), 0);
  return {
    overall: avg((attempt) => clampPct(attempt.score)),
    accuracy: answeredSteps > 0 ? Math.round((firstTryCorrect / answeredSteps) * 100) : 0,
    // Session-level clean-run rate is different from per-question first-try accuracy.
    firstTime: Math.round((validAttempts.filter((attempt) => attempt.wrongAnswers === 0).length / validAttempts.length) * 100),
    efficiency: avg((attempt) => {
      const budgetSeconds = Math.max(0, Number.isFinite(attempt.estimatedMinutes) ? (attempt.estimatedMinutes ?? 0) * 60 : 0);
      return budgetSeconds > 0 ? clampPct((budgetSeconds / Math.max(1, attempt.seconds)) * 100) : 0;
    }),
    inspection: avg((attempt) => (attempt.toolsUsed.includes("inspect") ? 100 : 60)),
    byCategory,
  };
}
